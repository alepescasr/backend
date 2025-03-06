import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { providerId: string } }
) {
  try {
    if (!params.providerId) {
      return new NextResponse("Provider id is required", { status: 400 });
    }

    const provider = await prismadb.provider.findUnique({
      where: {
        id: params.providerId,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { providerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.providerId) {
      return new NextResponse("Provider id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const provider = await prismadb.provider.delete({
      where: {
        id: params.providerId,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { providerId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.providerId) {
      return new NextResponse("Provider id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const provider = await prismadb.provider.update({
      where: {
        id: params.providerId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
