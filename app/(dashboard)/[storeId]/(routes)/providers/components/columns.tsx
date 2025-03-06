"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProviderColumn = {
  id: string;
  name: string;
  createdAt: string;
};

export const providerColumns: ColumnDef<ProviderColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de creación",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
