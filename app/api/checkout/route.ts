import { CreatePreferencePayload } from "mercadopago/models/preferences/create-payload.model";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.NEXT_ACCESS_TOKEN!,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const { cartItems, orderFormData } = await req.json();

  if (!cartItems || cartItems.length === 0) {
    return new NextResponse("Cart items are required", { status: 400 });
  }

  const productIds = cartItems.map(
    (item: { productId: string }) => item.productId
  );

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const productMap = products.reduce((map, product) => {
    map[product.id] = product;
    return map;
  }, {} as Record<string, any>);

  const items: CreatePreferencePayload["items"] = [];

  cartItems.forEach((item: { productId: string; quantity: number }) => {
    const product = productMap[item.productId];
    if (product) {
      items.push({
        title: product.name,
        unit_price: product.offerPrice
          ? product.offerPrice.toNumber()
          : product.price.toNumber(),
        quantity: item.quantity,
      });
    }
  });

  const order = await prismadb.order.create({
    data: {
      isPaid: false,
      orderItems: {
        create: cartItems.map(
          (item: { productId: string; quantity: number }) => ({
            product: {
              connect: {
                id: item.productId,
              },
            },
            quantity: item.quantity,
          })
        ),
      },
      formData: orderFormData,
    },
  });

  const preference: CreatePreferencePayload = {
    items,
    auto_return: "approved",
    back_urls: {
      success: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      failure: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    },
    notification_url: `${process.env.NEXT_PUBLIC_API_URL}/api/checkout/webhook`,
    external_reference: order.id,
  };

  const response = await mercadopago.preferences.create(preference);

  return NextResponse.json(
    { url: response.body.init_point },
    {
      headers: corsHeaders,
    }
  );
}
