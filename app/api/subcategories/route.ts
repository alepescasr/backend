import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    // Check if user is authenticated
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario tiene el rol de admin en Clerk
    const isAdmin =
      user?.publicMetadata?.role === "admin" ||
      user?.privateMetadata?.role === "admin";

    // Para simplificar, permitimos a todos los usuarios autenticados crear subcategorías
    // Puedes ajustar esto según tus necesidades de seguridad
    if (!isAdmin) {
      // Temporalmente permitimos a todos los usuarios crear subcategorías
      // return new NextResponse("Unauthorized - Admin access required", {
      //   status: 403,
      // });
    }

    const body = await req.json();
    const { name, categoryId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // Verificar que la categoría existe
    const categoryExists = await prismadb.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!categoryExists) {
      return new NextResponse("La categoría no existe", { status: 404 });
    }

    const subcategory = await prismadb.subcategory.create({
      data: {
        name,
        categoryId,
      },
    });

    return NextResponse.json(subcategory);
  } catch (error) {
    console.log("[SUBCATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const whereClause = categoryId ? { categoryId } : {};

    const subcategories = await prismadb.subcategory.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.log("[SUBCATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
