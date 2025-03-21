"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Image from "next/image";

export type PostColumn = {
  id: string;
  imageUrl: string;
  link: string;
  description: string;
  createdAt: string;
};

export const columns: ColumnDef<PostColumn>[] = [
  {
    accessorKey: "imageUrl",
    header: "Imagen",
    cell: ({ row }) => (
      <div className="relative h-10 w-10">
        <Image
          src={row.original.imageUrl}
          alt="Post image"
          fill
          className="rounded-md object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: "link",
    header: "Link",
    cell: ({ row }) => (
      <a
        href={row.original.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {row.original.link.length > 30
          ? row.original.link.substring(0, 30) + "..."
          : row.original.link}
      </a>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
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
