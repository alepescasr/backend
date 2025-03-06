"use client";

import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Provider } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

const formSchema = z.object({
  name: z.string().min(1),
});

type ProviderFormValues = z.infer<typeof formSchema>;

interface ProviderFormProps {
  initialData: Provider | null;
}

export const ProviderForm: React.FC<ProviderFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar proveedor" : "Crear proveedor";
  const description = initialData
    ? "Editar un proveedor"
    : "Añadir un nuevo proveedor";
  const toastMessage = initialData
    ? "Proveedor actualizado."
    : "Proveedor creado.";
  const action = initialData ? "Guardar cambios" : "Crear";

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
    },
  });

  const onSubmit = async (data: ProviderFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/providers/${params.providerId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/providers`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/providers`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/providers/${params.providerId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/providers`);
      toast.success("Proveedor eliminado.");
    } catch (error) {
      toast.error(
        "Asegúrate de eliminar todos los productos que usan este proveedor primero."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre del proveedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
