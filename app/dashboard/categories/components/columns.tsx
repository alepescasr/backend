"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Image from "next/image";

export type CategoryColumn = {
  id: string;
  name: string;
  title: string | null;
  imageUrl: string | null;
  createdAt: string;
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "imageUrl",
    header: "Imagen",
    cell: ({ row }) => {
      const imageUrl = row.original.imageUrl;
      if (!imageUrl)
        return <div className="text-muted-foreground text-sm">Sin imagen</div>;

      return (
        <div className="relative h-10 w-10">
          <Image
            src={imageUrl}
            alt={row.original.name}
            fill
            className="rounded-md object-cover"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      const title = row.original.title;
      if (!title)
        return <div className="text-muted-foreground text-sm">Sin título</div>;
      return title;
    },
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
