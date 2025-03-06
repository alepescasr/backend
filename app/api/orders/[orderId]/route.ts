import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

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
