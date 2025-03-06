"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type SubcategoryColumn = {
  id: string;
  name: string;
  categoryName: string;
  createdAt: string;
};

export const columns: ColumnDef<SubcategoryColumn>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "categoryName",
    header: "Categoría",
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
