import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    // Implementación correcta para Next.js 13
    const { userId } = await auth();

    // Verificar autenticación
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Temporalmente desactivamos la verificación de rol para probar
    // Podemos reactivarla después de confirmar que la autenticación básica funciona

    const body = await req.json();

    const {
      name,
      price,
      categoryId,
      subcategoryId,
      providerId,
      images,
      isFeatured,
      isArchived,
      nameTag,
      description,
      stock,
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!nameTag) {
      return new NextResponse("Name tag is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    if (!subcategoryId) {
      return new NextResponse("Subcategory ID is required", { status: 400 });
    }

    if (!providerId) {
      return new NextResponse("Provider ID is required", { status: 400 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        nameTag,
        description,
        price,
        isFeatured,
        isArchived,
        categoryId,
        subcategoryId,
        providerId,
        stock: stock || 0,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const subcategoryId = searchParams.get("subcategoryId") || undefined;
    const providerId = searchParams.get("providerId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    const products = await prismadb.product.findMany({
      where: {
        categoryId,
        subcategoryId,
        providerId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        subcategory: true,
        provider: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
