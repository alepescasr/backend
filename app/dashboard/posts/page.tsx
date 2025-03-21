import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { PostsClient } from "./components/client";

export default async function PostsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const posts = await prismadb.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedPosts = posts.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    link: item.link,
    description:
      item.description.length > 50
        ? item.description.substring(0, 50) + "..."
        : item.description,
    createdAt: format(item.createdAt, "dd/MM/yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PostsClient data={formattedPosts} />
      </div>
    </div>
  );
}
