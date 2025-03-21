import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

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
    const { userId, sessionClaims } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar que el usuario sea administrador usando metadatos de Clerk
    const publicMetadata = sessionClaims?.public as PublicMetadata;
    const role = publicMetadata?.role;

    if (role !== "admin") {
      return new NextResponse("Unauthorized - Admin access required", {
        status: 403,
      });
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
    const { userId, sessionClaims } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Verificar que el usuario sea administrador usando metadatos de Clerk
    const publicMetadata = sessionClaims?.public as PublicMetadata;
    const role = publicMetadata?.role;

    if (role !== "admin") {
      return new NextResponse("Unauthorized - Admin access required", {
        status: 403,
      });
    }

    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    const post = await prismadb.post.delete({
      where: {
        id: params.postId,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
