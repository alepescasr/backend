import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

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

    // Check if user is authenticated and has admin role
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verify user is an admin
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized - Admin access required", {
        status: 403,
      });
    }

    const body = await req.json();
    const { name } = body;

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

    // Check if user is authenticated and has admin role
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verify user is an admin
    const user = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.role !== "admin") {
      return new NextResponse("Unauthorized - Admin access required", {
        status: 403,
      });
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
