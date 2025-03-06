import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
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

    const provider = await prismadb.provider.create({
      data: {
        name,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.log("[PROVIDERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const providers = await prismadb.provider.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.log("[PROVIDERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
