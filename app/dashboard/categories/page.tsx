import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { CategoriesClient } from "./components/client";

export default async function CategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const categories = await prismadb.category.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories = categories.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(item.createdAt, "dd/MM/yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoriesClient data={formattedCategories} />
      </div>
    </div>
  );
}
