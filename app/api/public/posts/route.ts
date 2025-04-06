import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

// GET handler for retrieving latest posts for public use
export async function GET(req: Request) {
  try {
    // Get the latest posts, ordered by creation date
    const posts = await prismadb.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3, // Limit to 3 posts
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.log("[PUBLIC_POSTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
