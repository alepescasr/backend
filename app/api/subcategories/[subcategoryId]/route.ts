import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { isCurrentUserAdmin, getCurrentUserRole } from "@/lib/auth-utils";

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

export async function GET(
  req: Request,
  { params }: { params: { subcategoryId: string } }
) {
  try {
    if (!params.subcategoryId) {
      return new NextResponse("Subcategory id is required", { status: 400 });
    }

    const subcategory = await prismadb.subcategory.findUnique({
      where: {
        id: params.subcategoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    console.log("[SUBCATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { subcategoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador usando las funciones de utilidad
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para PATCH subcategory:", {
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

    const { name, categoryId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const subcategory = await prismadb.subcategory.update({
      where: {
        id: params.subcategoryId,
      },
      data: {
        name,
        categoryId,
      },
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    console.log("[SUBCATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { subcategoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador usando las funciones de utilidad
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para DELETE subcategory:", {
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

    if (!params.subcategoryId) {
      return new NextResponse("Subcategory id is required", { status: 400 });
    }

    // Check if there are any products using this subcategory
    const productsUsingSubcategory = await prismadb.product.findFirst({
      where: {
        subcategoryId: params.subcategoryId,
      },
    });

    if (productsUsingSubcategory) {
      console.log("[SUBCATEGORY_DELETE] Cannot delete: Used by products", {
        subcategoryId: params.subcategoryId,
        productId: productsUsingSubcategory.id,
      });
      return new NextResponse(
        "Cannot delete subcategory that is being used by products",
        { status: 400 }
      );
    }

    const subcategory = await prismadb.subcategory.delete({
      where: {
        id: params.subcategoryId,
      },
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    console.log("[SUBCATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
