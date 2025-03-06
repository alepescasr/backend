import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

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
