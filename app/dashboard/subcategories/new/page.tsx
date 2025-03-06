import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { SubcategoryForm } from "../components/subcategory-form";

export default async function NewSubcategoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Obtener categorías para el formulario
  const categories = await prismadb.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SubcategoryForm initialData={null} categories={categories} />
      </div>
    </div>
  );
}
