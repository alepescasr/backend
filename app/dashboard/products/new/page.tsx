import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { ProductForm } from "../[productId]/components/product-form";

export default async function NewProductPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const categories = await prismadb.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const subcategories = await prismadb.subcategory.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const providers = await prismadb.provider.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          subcategories={subcategories}
          providers={providers}
          initialData={null}
        />
      </div>
    </div>
  );
}
