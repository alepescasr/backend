import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(req.url);

    // Verificar autenticación
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Obtener parámetros de filtro
    const categoryId = searchParams.get("categoryId") || undefined;
    const subcategoryId = searchParams.get("subcategoryId") || undefined;
    const providerId = searchParams.get("providerId") || undefined;
    const productId = searchParams.get("productId") || undefined;
    const countOnly = searchParams.get("countOnly") === "true";

    // Validar que al menos un parámetro de filtro esté presente
    if (!categoryId && !subcategoryId && !providerId && !productId) {
      return NextResponse.json({
        count: 0,
        message: "No filter criteria provided",
      });
    }

    // Construir el filtro
    const filter: any = {
      isArchived: false,
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }

    if (providerId) {
      // Asegurarse de que providerId sea tratado correctamente (puede ser null en la base de datos)
      filter.providerId = providerId;
    }

    if (productId) {
      filter.id = productId;
    }

    // Imprimir el filtro para depuración
    console.log(
      "[PRICE_UPDATES_PREVIEW_FILTER]",
      JSON.stringify(filter, null, 2)
    );

    // Si solo se necesita el conteo
    if (countOnly) {
      try {
        // Realizar la consulta directamente sin timeout para depuración
        const count = await prismadb.product.count({
          where: filter,
        });

        console.log("[PRICE_UPDATES_PREVIEW_COUNT]", count);
        return NextResponse.json({ count });
      } catch (error) {
        console.log("[PRICE_UPDATES_PREVIEW_COUNT_ERROR]", error);
        return NextResponse.json(
          { count: 0, error: "Database error", details: String(error) },
          { status: 500 }
        );
      }
    }

    // Si se necesita la lista de productos
    try {
      const products = await prismadb.product.findMany({
        where: filter,
        select: {
          id: true,
          name: true,
          price: true,
          providerId: true,
          categoryId: true,
          subcategoryId: true,
        },
        orderBy: {
          name: "asc",
        },
        take: 100, // Limitar a 100 productos para evitar consultas muy grandes
      });

      console.log("[PRICE_UPDATES_PREVIEW_PRODUCTS]", products.length);
      return NextResponse.json(products);
    } catch (error) {
      console.log("[PRICE_UPDATES_PREVIEW_LIST_ERROR]", error);
      return NextResponse.json(
        { error: "Error retrieving product list", details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("[PRICE_UPDATES_PREVIEW]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
