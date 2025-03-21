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

    // Para simplificar, permitimos a todos los usuarios autenticados crear posts
    if (!isAdmin) {
      // Temporalmente permitimos a todos los usuarios crear posts
      // return new NextResponse("Unauthorized - Admin access required", {
      //   status: 403,
      // });
    }

    const body = await req.json();
    const { imageUrl, link, description } = body;

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!link) {
      return new NextResponse("Link is required", { status: 400 });
    }

    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    const post = await prismadb.post.create({
      data: {
        imageUrl,
        link,
        description,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POSTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const posts = await prismadb.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.log("[POSTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
