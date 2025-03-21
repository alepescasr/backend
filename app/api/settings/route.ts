import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

// Valores por defecto para la configuración
const DEFAULT_SETTINGS = {
  shippingFee: 2000,
  currency: "ARS",
  currencySymbol: "$",
  siteName: "Ciro Ecommerce",
  contactEmail: "info@ciro-ecommerce.com",
  contactPhone: "+54 11 1234-5678",
  socialMedia: {
    instagram: "https://instagram.com/ciro-ecommerce",
    facebook: "https://facebook.com/ciro-ecommerce",
    twitter: "https://twitter.com/ciro-ecommerce",
  },
};

export async function GET() {
  try {
    // En una implementación más avanzada, podrías almacenar esta configuración en la base de datos
    // y recuperarla desde allí. Por ahora, simplemente devolvemos los valores por defecto.

    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.log("[SETTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, sessionClaims } = auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar que el usuario sea administrador usando metadatos de Clerk
    const publicMetadata = sessionClaims?.public as PublicMetadata;
    const role = publicMetadata?.role;

    if (role !== "admin") {
      return new NextResponse("Unauthorized - Admin access required", {
        status: 403,
      });
    }

    // Validar los datos recibidos
    // En una implementación real, aquí actualizarías la configuración en la base de datos

    // Por ahora, simplemente devolvemos los datos recibidos como si se hubieran actualizado
    return NextResponse.json({
      ...DEFAULT_SETTINGS,
      ...body,
      updated: true,
    });
  } catch (error) {
    console.log("[SETTINGS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
