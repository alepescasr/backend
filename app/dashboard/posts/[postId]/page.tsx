import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { PostForm } from "./components/post-form";

export default async function PostPage({
  params,
}: {
  params: { postId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const post = await prismadb.post.findUnique({
    where: {
      id: params.postId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PostForm initialData={post} />
      </div>
    </div>
  );
}
