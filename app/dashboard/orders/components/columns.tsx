"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type OrderColumn = {
  id: string;
  formData: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Productos",
  },
  {
    accessorKey: "formData",
    header: "Información del cliente",
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
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
