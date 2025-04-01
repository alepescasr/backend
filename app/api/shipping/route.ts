import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { createCorsHeaders } from "@/lib/cors-utils";

// Precio de envío por defecto
const DEFAULT_SHIPPING_FEE = 2000;

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

export async function GET(req: Request) {
  try {
    // Obtener parámetros de consulta (por ejemplo, código postal, proveedor de envío)
    const url = new URL(req.url);
    const postalCode = url.searchParams.get("postalCode");
    const shippingProvider = url.searchParams.get("provider");

    // Obtener el origen y crear cabeceras con CORS
    const origin = req.headers.get("origin");
    const headers = createCorsHeaders(origin);

    // Por ahora, solo devolvemos el precio por defecto
    // En el futuro, se puede implementar un cálculo basado en el código postal y proveedor
    return NextResponse.json(
      {
        shippingFee: DEFAULT_SHIPPING_FEE,
        currency: "ARS",
        description: "Envío estándar a todo el país",
        postalCode: postalCode || null,
        provider: shippingProvider || "standard",
      },
      {
        headers,
        status: 200,
      }
    );
  } catch (error) {
    console.log("[SHIPPING_GET]", error);
    const origin = req.headers.get("origin");
    const headers = createCorsHeaders(origin);
    return new NextResponse("Internal error", {
      status: 500,
      headers,
    });
  }
}

// Endpoint para calcular el precio de envío basado en los parámetros
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postalCode, provider, weight, dimensions } = body;

    // Validar que al menos el código postal esté presente
    if (!postalCode) {
      const origin = req.headers.get("origin");
      const headers = createCorsHeaders(origin);
      return new NextResponse("Postal code is required", {
        status: 400,
        headers,
      });
    }

    // Aquí iría la lógica para calcular el precio de envío basado en los parámetros
    // Por ahora, implementaremos una lógica simple basada en el código postal

    let calculatedFee = DEFAULT_SHIPPING_FEE;

    // Ejemplo: códigos postales de CABA tienen un precio menor
    if (postalCode.startsWith("1")) {
      calculatedFee = 1500;
    }
    // Ejemplo: códigos postales lejanos tienen un precio mayor
    else if (parseInt(postalCode) > 8000) {
      calculatedFee = 3000;
    }

    const origin = req.headers.get("origin");
    const headers = createCorsHeaders(origin);

    return NextResponse.json(
      {
        shippingFee: calculatedFee,
        currency: "ARS",
        description: `Envío a código postal ${postalCode}`,
        postalCode,
        provider: provider || "standard",
        weight: weight || null,
        dimensions: dimensions || null,
      },
      {
        headers,
        status: 200,
      }
    );
  } catch (error) {
    console.log("[SHIPPING_POST]", error);
    const origin = req.headers.get("origin");
    const headers = createCorsHeaders(origin);
    return new NextResponse("Internal error", {
      status: 500,
      headers,
    });
  }
}

// Endpoint para actualizar el precio de envío (solo para administradores)
export async function PATCH(req: Request) {
  try {
    const { userId, sessionClaims } = auth();
    const body = await req.json();

    const { shippingFee } = body;
    const origin = req.headers.get("origin");
    const headers = createCorsHeaders(origin);

    if (!userId) {
      return new NextResponse("Unauthenticated", {
        status: 403,
        headers,
      });
    }

    // Verificar que el usuario sea administrador usando metadatos de Clerk
    const publicMetadata = sessionClaims?.public as PublicMetadata;
    const role = publicMetadata?.role;

    if (role !== "admin") {
      return new NextResponse("Unauthorized - Admin access required", {
        status: 403,
        headers,
      });
    }

    if (!shippingFee || isNaN(Number(shippingFee))) {
      return new NextResponse("Shipping fee is required and must be a number", {
        status: 400,
        headers,
      });
    }

    // Aquí podrías actualizar el precio de envío base en una tabla de configuración
    // Por ahora, solo devolvemos el nuevo precio como si se hubiera actualizado
    return NextResponse.json(
      {
        shippingFee: Number(shippingFee),
        updated: true,
      },
      {
        headers,
        status: 200,
      }
    );
  } catch (error) {
    console.log("[SHIPPING_PATCH]", error);
    const origin = req.headers.get("origin");
    const headers = createCorsHeaders(origin);
    return new NextResponse("Internal error", {
      status: 500,
      headers,
    });
  }
}

// Añadir soporte para pre-vuelo CORS (OPTIONS)
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  const headers = createCorsHeaders(origin);

  return new NextResponse(null, {
    status: 204, // No Content
    headers,
  });
}
