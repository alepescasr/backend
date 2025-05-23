"use client";

import * as z from "zod";
import { useState } from "react";
import { Billboard } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";

const formSchema = z.object({
  title: z.string().min(1, { message: "El título es requerido" }),
  imageUrl: z.string().min(1, { message: "La imagen es requerida" }),
  isActive: z.boolean().default(false),
  order: z.coerce
    .number()
    .int()
    .min(0, { message: "El orden debe ser un número positivo" }),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
  initialData: Billboard | null;
}

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Billboard" : "Crear Billboard";
  const description = initialData
    ? "Editar un billboard existente"
    : "Añadir un nuevo billboard";
  const toastMessage = initialData
    ? "Billboard actualizado"
    : "Billboard creado";
  const action = initialData ? "Guardar cambios" : "Crear";

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      imageUrl: "",
      isActive: false,
      order: 0,
    },
  });

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);

      // Get count of billboards if creating a new one
      if (!initialData) {
        const response = await axios.get("/api/billboards");
        const billboards = response.data;

        if (billboards.length >= 3) {
          toast.error("No se pueden crear más de 3 billboards");
          return;
        }
      }

      if (initialData) {
        await axios.patch(`/api/billboards/${params.billboardId}`, data);
      } else {
        await axios.post(`/api/billboards`, data);
      }

      router.refresh();
      router.push(`/dashboard/billboards`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error("Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/billboards/${params.billboardId}`);
      router.refresh();
      router.push(`/dashboard/billboards`);
      toast.success("Billboard eliminado.");
    } catch (error: any) {
      toast.error("Algo salió mal.");
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
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={loading}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Título del banner"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="Orden de visualización"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Activo</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mostrar en la página de inicio
                    </p>
                  </div>
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
