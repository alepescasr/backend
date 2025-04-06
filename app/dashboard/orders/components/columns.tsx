"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export type OrderColumn = {
  id: string;
  formData: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
};

const ViewButton = ({ id }: { id: string }) => {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      onClick={() => router.push(`/dashboard/orders/${id}`)}
    >
      <Eye className="h-4 w-4 mr-2" />
      Ver detalles
    </Button>
  );
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Productos",
  },
  {
    accessorKey: "clientName",
    header: "Cliente",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.clientName}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.clientEmail}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "totalPrice",
    header: "Valor Total",
  },
  {
    accessorKey: "isPaid",
    header: "Pagada",
    cell: ({ row }) => (
      <div className={row.original.isPaid ? "text-green-600" : "text-red-600"}>
        {row.original.isPaid ? "Sí" : "No"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
  },
  {
    id: "view",
    cell: ({ row }) => <ViewButton id={row.original.id} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
