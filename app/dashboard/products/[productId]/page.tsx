import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      color: true,
    },
  });

  // Serialize the product data to handle Decimal values
  const serializedProduct = product
    ? {
        ...product,
        price: product.price.toString(),
        offerPrice: product.offerPrice ? product.offerPrice.toString() : null,
        costPrice: product.costPrice ? product.costPrice.toString() : null,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    : null;

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

  const colors = await prismadb.color.findMany({
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
          colors={colors}
          initialData={serializedProduct}
        />
      </div>
    </div>
  );
}
