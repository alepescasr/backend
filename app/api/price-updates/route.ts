import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    // Verificar autenticación
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const body = await req.json();
    const { updateType, percentage, filters } = body;

    if (!updateType) {
      return new NextResponse("Update type is required", { status: 400 });
    }

    if (!percentage || percentage <= 0 || percentage > 100) {
      return new NextResponse("Valid percentage is required (0.01-100)", {
        status: 400,
      });
    }

    // Construir el filtro
    const filter: any = {
      isArchived: false,
    };

    if (updateType === "category" && filters.categoryId) {
      filter.categoryId = filters.categoryId;
    } else if (updateType === "subcategory" && filters.subcategoryId) {
      filter.subcategoryId = filters.subcategoryId;
    } else if (updateType === "provider" && filters.providerId) {
      filter.providerId = filters.providerId;
    } else if (updateType === "product" && filters.productId) {
      filter.id = filters.productId;
    } else {
      return new NextResponse("Invalid filter criteria", { status: 400 });
    }

    // Obtener productos afectados
    const products = await prismadb.product.findMany({
      where: filter,
      select: {
        id: true,
        price: true,
        offerPrice: true,
        hasOffer: true,
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found matching the criteria", {
        status: 404,
      });
    }

    // Actualizar cada producto
    const updatePromises = products.map((product) => {
      // Calcular nuevos precios
      const multiplier = 1 + percentage / 100;
      const newPrice = new Prisma.Decimal(
        product.price.toNumber() * multiplier
      );

      // Actualizar también el precio de oferta si existe
      let updateData: any = {
        price: newPrice,
      };

      if (product.hasOffer && product.offerPrice) {
        updateData.offerPrice = new Prisma.Decimal(
          product.offerPrice.toNumber() * multiplier
        );
      }

      return prismadb.product.update({
        where: { id: product.id },
        data: updateData,
      });
    });

    // Ejecutar todas las actualizaciones
    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Updated prices for ${products.length} products with a ${percentage}% increase.`,
    });
  } catch (error) {
    console.log("[PRICE_UPDATES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
