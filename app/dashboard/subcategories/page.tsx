import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { SubcategoriesClient } from "./components/client";

export default async function SubcategoriesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const subcategories = await prismadb.subcategory.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedSubcategories = subcategories.map((item) => ({
    id: item.id,
    name: item.name,
    categoryName: item.category.name,
    createdAt: format(item.createdAt, "dd/MM/yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SubcategoriesClient data={formattedSubcategories} />
      </div>
    </div>
  );
}
