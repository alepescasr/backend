import prismadb from "@/lib/prismadb";

import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
    },
  });

  const categories = await prismadb.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Si hay un producto y tiene categoryId, buscar subcategorías de esa categoría
  // Si no, obtener todas las subcategorías
  const subcategories = await prismadb.subcategory.findMany({
    where: product?.categoryId
      ? {
          categoryId: product.categoryId,
        }
      : undefined,
    orderBy: {
      name: "asc",
    },
  });

  const providers = await prismadb.provider.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // const sizes = await prismadb.size.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  // });

  // const colors = await prismadb.color.findMany({
  //   where: {
  //     storeId: params.storeId,
  //   },
  // });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          subcategories={subcategories}
          providers={providers}
          // colors={colors}
          // sizes={sizes}
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;
