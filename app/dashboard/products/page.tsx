import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { ProductsClient } from "./components/client";

export default async function ProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const products = await prismadb.product.findMany({
    include: {
      category: true,
      subcategory: true,
      provider: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts = products.map((item) => ({
    id: item.id,
    name: item.name,
    price: formatter.format(item.price.toNumber()),
    category: item.category.name,
    subcategory: item.subcategory.name,
    provider: item.provider?.name || "Sin proveedor",
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    createdAt: format(item.createdAt, "dd/MM/yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
}
