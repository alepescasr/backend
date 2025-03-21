import { CreatePreferencePayload } from "mercadopago/models/preferences/create-payload.model";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import mercadopago from "mercadopago";
import { Prisma } from "@prisma/client";

mercadopago.configure({
  access_token: process.env.NEXT_ACCESS_TOKEN_MERCADO_PAGO!,
});

// Precio de envío por defecto (se usará si no se proporciona uno desde el frontend)
const DEFAULT_SHIPPING_FEE = 2000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const { cartItems, orderFormData, shippingFee } = await req.json();

  if (!cartItems || cartItems.length === 0) {
    return new NextResponse("Cart items are required", { status: 400 });
  }

  // Usar el costo de envío proporcionado por el frontend o usar el valor por defecto
  const appliedShippingFee = shippingFee
    ? Number(shippingFee)
    : DEFAULT_SHIPPING_FEE;

  // Validar que el costo de envío sea un número válido
  if (isNaN(appliedShippingFee)) {
    return new NextResponse("Invalid shipping fee", { status: 400 });
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

  // Calcular el subtotal de los productos
  let subtotal = 0;

  cartItems.forEach((item: { productId: string; quantity: number }) => {
    const product = productMap[item.productId];
    if (product) {
      const price = product.offerPrice
        ? product.offerPrice.toNumber()
        : product.price.toNumber();

      subtotal += price * item.quantity;

      items.push({
        title: product.name,
        unit_price: price,
        quantity: item.quantity,
      });
    }
  });

  // Agregar el envío como un ítem separado
  items.push({
    title: "Envío estándar",
    unit_price: appliedShippingFee,
    quantity: 1,
  });

  // Calcular el total incluyendo el envío
  const totalAmount = subtotal + appliedShippingFee;

  // Crear datos para la orden con manejo condicional de los campos nuevos
  const orderData: Prisma.OrderCreateInput = {
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
  };

  // Intentar agregar los campos de envío si existen en el modelo
  try {
    // @ts-ignore - Estos campos pueden no existir hasta que se aplique la migración
    orderData.shippingFee = appliedShippingFee;
    // @ts-ignore - Estos campos pueden no existir hasta que se aplique la migración
    orderData.totalAmount = totalAmount;
  } catch (error) {
    console.log("Campos de envío no disponibles aún:", error);
  }

  const order = await prismadb.order.create({
    data: orderData,
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
    {
      url: response.body.init_point,
      orderId: order.id,
      subtotal,
      shippingFee: appliedShippingFee,
      totalAmount,
    },
    {
      headers: corsHeaders,
    }
  );
}
