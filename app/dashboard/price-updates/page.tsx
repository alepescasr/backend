import prismadb from "@/lib/prismadb";
import { PriceUpdateForm } from "./components/price-update-form";

const PriceUpdatesPage = async () => {
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

  const products = await prismadb.product.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PriceUpdateForm
          categories={categories}
          subcategories={subcategories}
          providers={providers}
          products={products}
        />
      </div>
    </div>
  );
};

export default PriceUpdatesPage;
