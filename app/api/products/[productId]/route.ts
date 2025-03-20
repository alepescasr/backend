import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        category: true,
        subcategory: true,
        provider: true,
        color: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Find the user in our database
    const userRecord = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    // // Check if user exists and has admin role
    // if (!userRecord || userRecord.role !== "admin") {
    //   return new NextResponse("Unauthorized - Admin access required", {
    //     status: 403,
    //   });
    // }

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
      colorId,
      weight,
      attributes,
      hasOffer,
      offerPrice,
      code,
      calibration,
      costPrice,
    } = body;

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

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

    // Update the product
    await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        nameTag,
        description,
        price,
        categoryId,
        subcategoryId,
        stock,
        colorId,
        weight,
        attributes,
        hasOffer: hasOffer || false,
        offerPrice,
        code,
        calibration,
        costPrice,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
      },
    });

    // Create new images
    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { userId } = auth();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Find the user in our database
    const userRecord = await prismadb.user.findUnique({
      where: {
        id: userId,
      },
    });

    // // Check if user exists and has admin role
    // if (!userRecord || userRecord.role !== "admin") {
    //   return new NextResponse("Unauthorized - Admin access required", {
    //     status: 403,
    //   });
    // }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Delete the product
    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
