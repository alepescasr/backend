import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Definir cabeceras CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-payment-method",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * API para procesar órdenes de transferencia bancaria
 */
export async function POST(req: Request) {
  try {
    console.log("==== API TRANSFERENCIA - INICIO DE PROCESO ====");

    const { cartItems, orderFormData, shippingFee, orderId } = await req.json();

    console.log("Datos recibidos:", {
      cartItemsCount: cartItems?.length,
      orderFormData: orderFormData
        ? JSON.stringify(orderFormData).slice(0, 200) + "..."
        : "No disponible",
      shippingFee,
      orderId,
    });

    // Si ya existe un orderId, estamos confirmando una orden existente
    if (orderId) {
      console.log(`Confirmando orden existente: ${orderId}`);
      try {
        const order = await prismadb.order.update({
          where: {
            id: orderId,
          },
          data: {
            formData: orderFormData,
          },
        });

        console.log(`✅ Orden actualizada exitosamente: ${orderId}`);
        return NextResponse.json(
          {
            success: true,
            message: "Orden confirmada correctamente",
            orderId: order.id,
          },
          { headers: corsHeaders }
        );
      } catch (error) {
        console.error(`❌ Error al actualizar orden ${orderId}:`, error);
        return NextResponse.json(
          {
            success: false,
            error: "Error al actualizar orden",
          },
          {
            status: 500,
            headers: corsHeaders,
          }
        );
      }
    }

    // Si no hay orderId, es una nueva orden
    if (!cartItems || cartItems.length === 0) {
      console.log("❌ Error: No se recibieron items en el carrito");
      return NextResponse.json(
        {
          success: false,
          error: "Se requieren productos en el carrito",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Asegurarnos que el método de pago es transferencia
    if (!orderFormData || orderFormData.paymentMethod !== "transfer") {
      console.log("❌ Error: El método de pago no es transferencia");
      return NextResponse.json(
        {
          success: false,
          error: "Esta API solo procesa pagos por transferencia",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // Calcular el total
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

    // Calcular el subtotal de los productos
    let subtotal = 0;

    cartItems.forEach((item: { productId: string; quantity: number }) => {
      const product = productMap[item.productId];
      if (product) {
        const price = product.offerPrice
          ? product.offerPrice.toNumber()
          : product.price.toNumber();

        subtotal += price * item.quantity;
      }
    });

    // Aplicar costo de envío
    const shippingCost = shippingFee || 2000;
    const totalAmount = subtotal + Number(shippingCost);

    console.log("Datos de la orden a crear:", {
      itemsCount: cartItems.length,
      shippingFee: shippingCost,
      subtotal,
      totalAmount,
      paymentMethod: "transfer",
    });

    // Crear la orden
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
        // @ts-ignore - Estos campos pueden no existir hasta que se aplique la migración
        shippingFee: shippingCost,
        // @ts-ignore - Estos campos pueden no existir hasta que se aplique la migración
        totalAmount,
      },
    });

    console.log(`✅ Orden creada exitosamente: ${order.id}`);
    return NextResponse.json(
      {
        success: true,
        message: "Orden creada correctamente",
        orderId: order.id,
        subtotal,
        shippingFee: shippingCost,
        totalAmount,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ Error al procesar orden por transferencia:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al procesar la orden",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
