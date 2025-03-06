"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, ProviderColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface ProvidersClientProps {
  data: ProviderColumn[];
}

export const ProvidersClient: React.FC<ProvidersClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Proveedores (${data.length})`}
          description="Maneja los proveedores de tu tienda"
        />
        <Button onClick={() => router.push(`/dashboard/providers/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir nuevo
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls para Proveedores" />
      <Separator />
      <ApiList entityName="providers" entityIdName="providerId" />
    </>
  );
};
