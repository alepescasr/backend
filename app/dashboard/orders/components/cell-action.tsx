"use client";

import { useState } from "react";
import { Copy, MessageCircle, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";

import { OrderColumn } from "./columns";

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/orders/${data.id}`);
      toast.success("Orden eliminada.");
      router.refresh();
    } catch (error) {
      toast.error("Algo salió mal.");
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID de orden copiado al portapapeles.");
  };

  // Función para generar el enlace de WhatsApp
  const generateWhatsAppLink = () => {
    // Verificar si tenemos un número de teléfono
    if (!data.clientPhone || data.clientPhone === "No disponible") {
      toast.error("No se encontró un número de teléfono válido");
      return null;
    }

    // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
    const cleanPhone = data.clientPhone.replace(/\D/g, "");

    // Verificar que el número tenga un formato válido
    if (!cleanPhone || cleanPhone.length < 8) {
      toast.error("El número de teléfono no tiene un formato válido");
      return null;
    }

    // Crear el mensaje preestablecido
    const message = `¡Hola ${data.clientName}! Tu compra en AlePesca por ${data.totalPrice} ha sido procesada correctamente. Te avisaremos cuando realicemos el envío. ¡Gracias por tu compra!`;

    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(message);

    // Retornar el enlace completo
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const handleWhatsAppClick = () => {
    const link = generateWhatsAppLink();
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
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
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" /> Copiar ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleWhatsAppClick}>
            <MessageCircle className="mr-2 h-4 w-4" /> Enviar WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
