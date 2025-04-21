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
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-payment-method",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const { cartItems, orderFormData, shippingFee } = await req.json();

  // Agregar log inicial para depuración
  console.log("==== CHECKOUT API - INICIO DE PROCESO ====");
  console.log("Datos recibidos:", {
    cartItemsCount: cartItems?.length,
    paymentMethod: orderFormData?.paymentMethod || "No especificado",
    orderFormData: orderFormData
      ? JSON.stringify(orderFormData).slice(0, 200) + "..."
      : "No disponible",
    shippingFee,
  });

  if (!cartItems || cartItems.length === 0) {
    console.log("ERROR: No se recibieron items en el carrito");
    return new NextResponse("Cart items are required", { status: 400 });
  }

  // Intentar obtener el costo de envío del formData si está disponible
  let shippingCostFromForm = null;
  if (orderFormData && typeof orderFormData === "object") {
    shippingCostFromForm =
      orderFormData.shippingCost !== undefined
        ? Number(orderFormData.shippingCost)
        : null;
  }

  // Usar el costo de envío en este orden de prioridad:
  // 1. Del formData (shippingCost)
  // 2. Del parámetro específico (shippingFee)
  // 3. Valor por defecto
  const appliedShippingFee =
    shippingCostFromForm !== null && !isNaN(shippingCostFromForm)
      ? shippingCostFromForm
      : shippingFee
      ? Number(shippingFee)
      : DEFAULT_SHIPPING_FEE;

  // Validar que el costo de envío sea un número válido
  if (isNaN(appliedShippingFee)) {
    return new NextResponse("Invalid shipping fee", { status: 400 });
  }

  console.log(
    "Shipping fee applied:",
    appliedShippingFee,
    "Source:",
    shippingCostFromForm !== null
      ? "formData.shippingCost"
      : shippingFee
      ? "shippingFee parameter"
      : "default value"
  );

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
        title: "Productos AlePesca",
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

  console.log("Datos de la orden a crear:", {
    itemsCount: cartItems.length,
    shippingFee: appliedShippingFee,
    subtotal,
    totalAmount,
    paymentMethod: orderFormData?.paymentMethod,
  });

  const order = await prismadb.order.create({
    data: orderData,
  });

  console.log("✅ Orden creada exitosamente:", {
    orderId: order.id,
    paymentMethod: orderFormData?.paymentMethod || "No especificado",
  });

  // Si es método de transferencia, no necesitamos crear preferencia en MercadoPago
  if (orderFormData?.paymentMethod === "transfer") {
    console.log(
      "🏦 Método de pago: Transferencia bancaria - Omitiendo MercadoPago"
    );
    return NextResponse.json(
      {
        url: `${process.env.FRONTEND_STORE_URL}/cart?success=1&transfer=1&orderId=${order.id}`,
        orderId: order.id,
        subtotal,
        shippingFee: appliedShippingFee,
        totalAmount,
        paymentMethod: "transfer",
      },
      {
        headers: corsHeaders,
      }
    );
  }

  // Si llegamos aquí, es método de MercadoPago
  console.log("💳 Método de pago: MercadoPago - Creando preferencia");
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

  try {
    const response = await mercadopago.preferences.create(preference);
    console.log("✅ Preferencia de MercadoPago creada:", {
      orderId: order.id,
      preferenceId: response.body.id,
      initPoint: response.body.init_point,
    });

    return NextResponse.json(
      {
        url: response.body.init_point,
        orderId: order.id,
        subtotal,
        shippingFee: appliedShippingFee,
        totalAmount,
        paymentMethod: "card",
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("❌ Error al crear preferencia en MercadoPago:", error);
    return NextResponse.json(
      {
        error: "Error al crear preferencia de pago",
        orderId: order.id,
        subtotal,
        shippingFee: appliedShippingFee,
        totalAmount,
      },
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
}
