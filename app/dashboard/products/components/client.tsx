"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, ProductColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface ProductsClientProps {
  data: ProductColumn[];
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Productos (${data.length})`}
          description="Maneja los productos de tu tienda"
        />
        <Button onClick={() => router.push(`/dashboard/products/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir nuevo
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Productos" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
