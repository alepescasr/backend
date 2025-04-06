import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

// GET handler for retrieving active billboards for public use
export async function GET(req: Request) {
  try {
    // Only get active billboards and order them by order field
    const billboards = await prismadb.billboard.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[PUBLIC_BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
