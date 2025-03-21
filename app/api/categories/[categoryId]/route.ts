import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { isCurrentUserAdmin, getCurrentUserRole } from "@/lib/auth-utils";

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        subcategories: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para PATCH:", {
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

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        title,
        imageUrl,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para DELETE:", {
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

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    // Check if there are any products using this category
    const productsUsingCategory = await prismadb.product.findFirst({
      where: {
        categoryId: params.categoryId,
      },
    });

    if (productsUsingCategory) {
      return new NextResponse(
        "Cannot delete category that is being used by products",
        { status: 400 }
      );
    }

    // Check if there are any subcategories using this category
    const subcategoriesUsingCategory = await prismadb.subcategory.findFirst({
      where: {
        categoryId: params.categoryId,
      },
    });

    if (subcategoriesUsingCategory) {
      return new NextResponse("Cannot delete category that has subcategories", {
        status: 400,
      });
    }

    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
