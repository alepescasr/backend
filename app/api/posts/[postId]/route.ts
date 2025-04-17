import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { isCurrentUserAdmin, getCurrentUserRole } from "@/lib/auth-utils";

// Interfaz para los metadatos públicos de Clerk
interface PublicMetadata {
  role?: string;
}

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    const post = await prismadb.post.findUnique({
      where: {
        id: params.postId,
      },
    });

    if (!post) {
      return new NextResponse("Post no encontrado", { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para PATCH post:", {
      userId,
      isAdmin,
      userRole,
      postId: params.postId,
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

    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    // Verificar que el post exista
    const existingPost = await prismadb.post.findUnique({
      where: { id: params.postId },
    });

    if (!existingPost) {
      console.log("[POST_PATCH] Post no encontrado:", params.postId);
      return new NextResponse("Post no encontrado", { status: 404 });
    }

    const post = await prismadb.post.update({
      where: {
        id: params.postId,
      },
      data: {
        imageUrl,
        link,
        description,
      },
    });

    console.log("[POST_PATCH] Post actualizado con éxito:", post.id);
    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar si el usuario es administrador
    const isAdmin = await isCurrentUserAdmin();
    const userRole = await getCurrentUserRole();

    console.log("🔒 Verificación de autorización para DELETE post:", {
      userId,
      isAdmin,
      userRole,
      postId: params.postId,
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

    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    // Verificar que el post exista
    const existingPost = await prismadb.post.findUnique({
      where: { id: params.postId },
    });

    if (!existingPost) {
      console.log("[POST_DELETE] Post no encontrado:", params.postId);
      return new NextResponse("Post no encontrado", { status: 404 });
    }

    const post = await prismadb.post.delete({
      where: {
        id: params.postId,
      },
    });

    console.log("[POST_DELETE] Post eliminado con éxito:", post.id);
    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
