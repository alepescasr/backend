import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

export async function GET(req: Request) {
  try {
    const { userId, sessionClaims } = auth();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar que el usuario sea administrador usando metadatos de Clerk
    // const publicMetadata = sessionClaims?.public as PublicMetadata;
    // const role = publicMetadata?.role;

    // if (role !== "admin") {
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
