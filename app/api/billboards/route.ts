import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

// GET handler for retrieving all billboards
export async function GET(req: Request) {
  try {
    const billboards = await prismadb.billboard.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST handler for creating a new billboard
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { imageUrl, title, isActive, order } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Check if already have 3 billboards
    const billboardCount = await prismadb.billboard.count();
    if (billboardCount >= 3) {
      return new NextResponse("Maximum number of billboards (3) reached", {
        status: 400,
      });
    }

    const billboard = await prismadb.billboard.create({
      data: {
        title,
        imageUrl,
        isActive: isActive || false,
        order: order || 0,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
