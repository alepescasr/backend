import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Constante para el precio de envío
const SHIPPING_FEE = 2000;

export async function GET() {
  try {
    // Devolver el precio de envío fijo
    return NextResponse.json({
      shippingFee: SHIPPING_FEE,
      currency: "ARS",
      description: "Envío estándar a todo el país",
    });
  } catch (error) {
    console.log("[SHIPPING_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Endpoint para actualizar el precio de envío (solo para administradores)
export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { shippingFee } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar que el usuario sea administrador
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user?.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!shippingFee || isNaN(Number(shippingFee))) {
      return new NextResponse("Shipping fee is required and must be a number", {
        status: 400,
      });
    }

    // Aquí podrías actualizar el precio de envío en una tabla de configuración
    // Por ahora, solo devolvemos el nuevo precio como si se hubiera actualizado
    return NextResponse.json({
      shippingFee: Number(shippingFee),
      updated: true,
    });
  } catch (error) {
    console.log("[SHIPPING_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Importación necesaria para la autenticación
import { auth } from "@clerk/nextjs";
