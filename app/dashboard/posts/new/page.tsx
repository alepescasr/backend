import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { PostForm } from "../[postId]/components/post-form";

export default async function NewPostPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if already have 3 posts
  const postCount = await prismadb.post.count();
  const hasReachedLimit = postCount >= 3;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {hasReachedLimit ? (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
            role="alert"
          >
            <p className="font-bold">Límite alcanzado</p>
            <p>
              No se pueden crear más de 3 posts. Por favor, elimine uno
              existente antes de crear uno nuevo.
            </p>
          </div>
        ) : (
          <PostForm initialData={null} />
        )}
      </div>
    </div>
  );
}
