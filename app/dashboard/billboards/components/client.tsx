"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ApiList } from "@/components/ui/api-list";

import { columns, BillboardColumn } from "./columns";

interface BillboardClientProps {
  data: BillboardColumn[];
  atLimit: boolean;
}

export const BillboardClient: React.FC<BillboardClientProps> = ({
  data,
  atLimit,
}) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${data.length}/3)`}
          description="Gestiona los banners promocionales para tu tienda"
        />
        <Button
          onClick={() => router.push(`/dashboard/billboards/new`)}
          disabled={atLimit}
        >
          <Plus className="mr-2 h-4 w-4" />
          {atLimit ? "Límite alcanzado" : "Añadir nuevo"}
        </Button>
      </div>
      {atLimit && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4"
          role="alert"
        >
          <p className="font-bold">Límite alcanzado</p>
          <p>
            Has alcanzado el límite de 3 billboards. Para añadir uno nuevo,
            primero debes eliminar uno existente.
          </p>
        </div>
      )}
      <Separator />
      <DataTable columns={columns} data={data} searchKey="title" />
      <Heading title="API" description="Endpoints de API para billboards" />
      <Separator />
      <ApiList entityName="billboards" entityIdName="billboardId" />
    </>
  );
};
