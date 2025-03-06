"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { providerColumns, ProviderColumn } from "./columns";

interface ProvidersClientProps {
  data: ProviderColumn[];
}

export const ProvidersClient: React.FC<ProvidersClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Proveedores (${data.length})`}
          description="Maneja los proveedores de tu tienda."
        />
        <Button onClick={() => router.push(`/${params.storeId}/providers/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir nuevo
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={providerColumns} data={data} />
      <Heading title="API" description="API Calls for Providers" />
      <Separator />
      <ApiList entityName="providers" entityIdName="providerId" />
    </>
  );
};
