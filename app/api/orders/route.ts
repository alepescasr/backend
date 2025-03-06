import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Find the user in our database
    const userRecord = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    // // Check if user exists and has admin role
    // if (!userRecord || userRecord.role !== "admin") {
    //   return new NextResponse("Unauthorized - Admin access required", {
    //     status: 403,
    //   });
    // }

    const orders = await prismadb.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log("[ORDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
