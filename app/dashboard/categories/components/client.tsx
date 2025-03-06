"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, CategoryColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface CategoriesClientProps {
  data: CategoryColumn[];
}

export const CategoriesClient: React.FC<CategoriesClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Categorías (${data.length})`}
          description="Maneja las categorías de tu tienda"
        />
        <Button onClick={() => router.push(`/dashboard/categories/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir nueva
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Categorías" />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  );
};
