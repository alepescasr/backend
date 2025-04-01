import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { isCurrentUserAdmin, getCurrentUserRole } from "@/lib/auth-utils";
import { createCorsHeaders } from "@/lib/cors-utils";

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para POST:", {
      userId,
      isAdmin,
      userRole,
    });

    if (!isAdmin) {
      return new NextResponse(
        `Unauthorized - Admin access required (Role: ${
          userRole || "undefined"
        })`,
        {
          status: 403,
        }
      );
    }

    const body = await req.json();
    const { name, title, imageUrl } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const category = await prismadb.category.create({
      data: {
        name,
        title,
        imageUrl,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Obtener el origen de la petición
    const origin = req.headers.get("origin");

    // Crear cabeceras con CORS configurado
    const headers = createCorsHeaders(origin);

    const categories = await prismadb.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(categories, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    // También aplicar cabeceras CORS en caso de error
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
