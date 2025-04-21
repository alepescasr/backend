import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { isCurrentUserAdmin, getCurrentUserRole } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }

    const order = await prismadb.order.delete({
      where: {
        id: params.orderId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = auth();
    console.log("==== ORDER PATCH API - INICIO DE PROCESO ====");
    console.log("Parámetros:", { orderId: params.orderId, userId });

    if (!userId) {
      console.log("❌ Autenticación fallida: Usuario no identificado");
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para PATCH orden:", {
      userId,
      isAdmin,
      userRole,
      orderId: params.orderId,
    });

    if (!isAdmin) {
      console.log(
        `❌ Autorización fallida: Usuario no es admin (Role: ${
          userRole || "undefined"
        })`
      );
      return new NextResponse(
        `Unauthorized - Admin access required (Role: ${
          userRole || "undefined"
        })`,
        {
          status: 403,
        }
      );
    }

    if (!params.orderId) {
      console.log("❌ Error: No se especificó ID de orden");
      return new NextResponse("Order id is required", { status: 400 });
    }

    const body = await req.json();
    const { isPaid } = body;

    console.log("📦 Datos recibidos para actualizar orden:", {
      orderId: params.orderId,
      isPaid,
      bodyData: JSON.stringify(body),
    });

    // Obtener la orden actual con sus productos
    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.log(`❌ Error: Orden no encontrada (ID: ${params.orderId})`);
      return new NextResponse("Order not found", { status: 404 });
    }

    console.log(`ℹ️ Estado actual de la orden: ${order.id}`, {
      currentIsPaid: order.isPaid,
      newIsPaid: isPaid,
      formData: order.formData ? "Disponible" : "No disponible",
      itemsCount: order.orderItems.length,
    });

    // Solo actualizar el stock si estamos marcando como pagada una orden que no estaba pagada
    if (isPaid === true && !order.isPaid) {
      console.log(`🔄 Actualizando stock para orden: ${order.id}`);
      // Actualizar el stock para cada producto en la orden
      for (const item of order.orderItems) {
        const currentStock = item.product.stock;
        const quantityToReduce = item.quantity;

        // Solo disminuir si hay suficiente stock disponible
        if (currentStock > 0) {
          // Calcular nuevo stock, asegurando que no sea negativo
          const newStock = Math.max(0, currentStock - quantityToReduce);

          await prismadb.product.update({
            where: {
              id: item.product.id,
            },
            data: {
              stock: newStock,
            },
          });

          console.log(
            `✅ Stock actualizado para producto ${item.product.id}: ${currentStock} -> ${newStock} (${item.product.name})`
          );
        } else {
          console.log(
            `⚠️ No hay stock suficiente para producto ${item.product.id}: ${currentStock} (${item.product.name})`
          );
        }
      }
    } else {
      console.log(`ℹ️ No se actualiza stock:`, {
        isPaidParameter: isPaid,
        currentOrderIsPaid: order.isPaid,
      });
    }

    // Actualizar la orden
    const updatedOrder = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        isPaid,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`✅ Orden ${params.orderId} actualizada: isPaid=${isPaid}`);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.log("[ORDER_PATCH] Error:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
