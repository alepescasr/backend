"use client";

import { useState } from "react";
import {
  Copy,
  Edit,
  MoreHorizontal,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";

import { BillboardColumn } from "./columns";

interface CellActionProps {
  data: BillboardColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/billboards/${data.id}`);
      toast.success("Billboard eliminado.");
      router.refresh();
    } catch (error) {
      toast.error("Algo salió mal.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onToggleActive = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/billboards/${data.id}`, {
        ...data,
        isActive: !data.isActive,
      });
      toast.success(`Billboard ${data.isActive ? "desactivado" : "activado"}.`);
      router.refresh();
    } catch (error) {
      toast.error("Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = () => {
    navigator.clipboard.writeText(data.id);
    toast.success("ID copiado al portapapeles.");
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/billboards/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Actualizar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleActive}>
            {data.isActive ? (
              <>
                <XCircle className="mr-2 h-4 w-4" /> Desactivar
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Activar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
