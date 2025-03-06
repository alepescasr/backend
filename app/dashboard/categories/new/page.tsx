import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { CategoryForm } from "../components/category-form";

export default async function NewCategoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm initialData={null} />
      </div>
    </div>
  );
}
