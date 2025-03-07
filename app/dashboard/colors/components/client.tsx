"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { ColorColumn, columns } from "./columns";

interface ColorsClientProps {
  data: ColorColumn[];
}

export const ColorsClient: React.FC<ColorsClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Colores (${data.length})`}
          description="Administra los colores de tus productos"
        />
        <Button onClick={() => router.push(`/dashboard/colors/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Colores" />
      <Separator />
      <ApiList entityName="colors" entityIdName="colorId" />
    </>
  );
};
