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
    // Esto asume que has configurado "admin" como un rol en Clerk
    const isAdmin =
      user?.publicMetadata?.role === "admin" ||
      user?.privateMetadata?.role === "admin";

    // Para simplificar, permitimos a todos los usuarios autenticados crear categorías
    // Puedes ajustar esto según tus necesidades de seguridad
    if (!isAdmin) {
      // Temporalmente permitimos a todos los usuarios crear categorías
      // return new NextResponse("Unauthorized - Admin access required", {
      //   status: 403,
      // });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const category = await prismadb.category.create({
      data: {
        name,
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
    const categories = await prismadb.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
