import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { isCurrentUserAdmin, getCurrentUserRole } from "@/lib/auth-utils";

// Límite máximo de posts que se pueden crear
const MAX_POSTS = 3;

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para POST nuevo post:", {
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

    // Verificar el límite de posts
    const postsCount = await prismadb.post.count();
    if (postsCount >= MAX_POSTS) {
      return new NextResponse(
        `Maximum number of posts (${MAX_POSTS}) reached. Delete existing posts before creating new ones.`,
        { status: 400 }
      );
    }

    const post = await prismadb.post.create({
      data: {
        imageUrl,
        link,
        description,
      },
    });

    console.log("[POST_CREATE] Post creado con éxito:", post.id);
    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_CREATE]", error);
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
