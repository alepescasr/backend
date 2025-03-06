"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Category, Subcategory } from "@prisma/client";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
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
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  categoryId: z.string().min(1, {
    message: "Debes seleccionar una categoría",
  }),
});

type SubcategoryFormValues = z.infer<typeof formSchema>;

interface SubcategoryFormProps {
  initialData: Subcategory | null;
  categories: Category[];
}

export const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  initialData,
  categories,
}) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar subcategoría" : "Crear subcategoría";
  const description = initialData
    ? "Editar una subcategoría existente."
    : "Añadir una nueva subcategoría.";
  const toastMessage = initialData
    ? "Subcategoría actualizada."
    : "Subcategoría creada.";
  const action = initialData ? "Guardar cambios" : "Crear";

  const form = useForm<SubcategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      categoryId: "",
    },
  });

  const onSubmit = async (data: SubcategoryFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        // Actualizar subcategoría existente
        await axios.patch(`/api/subcategories/${initialData.id}`, data);
      } else {
        // Crear nueva subcategoría
        await axios.post("/api/subcategories", data);
      }
      router.refresh();
      router.push("/dashboard/subcategories");
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Algo salió mal.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/subcategories/${initialData?.id}`);
      router.refresh();
      router.push("/dashboard/subcategories");
      toast.success("Subcategoría eliminada.");
    } catch (error) {
      toast.error(
        "Asegúrate de haber eliminado todos los productos que usan esta subcategoría."
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
            size="icon"
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Selecciona una categoría"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre de la subcategoría"
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
