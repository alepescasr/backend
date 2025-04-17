"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Post } from "@prisma/client";

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
import ImageUpload from "@/components/ui/image-upload";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  imageUrl: z.string().min(1),
  link: z.string().min(1),
  description: z.string().min(1),
});

type PostFormValues = z.infer<typeof formSchema>;

interface PostFormProps {
  initialData: Post | null;
}

export const PostForm: React.FC<PostFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar post" : "Crear post";
  const description = initialData
    ? "Editar un post existente"
    : "Crear un nuevo post";
  const toastMessage = initialData ? "Post actualizado." : "Post creado.";
  const action = initialData ? "Guardar cambios" : "Crear";

  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      imageUrl: "",
      link: "",
      description: "",
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/posts/${params.postId}`, data);
      } else {
        try {
          await axios.post("/api/posts", data);
        } catch (error: any) {
          if (
            error.response?.status === 400 &&
            error.response?.data.includes("Maximum number of posts")
          ) {
            toast.error(
              "No se pueden crear más de 3 posts. Por favor, elimine uno existente."
            );
            router.push("/dashboard/posts");
            return;
          }
          throw error;
        }
      }
      router.refresh();
      router.push("/dashboard/posts");
      toast.success(toastMessage);
    } catch (error: any) {
      console.error("Error al guardar post:", error);

      if (error.response) {
        // Error con respuesta del servidor
        const status = error.response.status;
        const message = error.response.data || "Error desconocido";

        if (status === 404) {
          toast.error("El post no existe o ya fue eliminado.");
        } else if (status === 403) {
          toast.error("No tienes permisos para modificar este post.");
        } else {
          toast.error(`Error: ${message}`);
        }

        console.error(`Error ${status}:`, message);
      } else if (error.request) {
        // Error de red sin respuesta
        toast.error("No se pudo conectar con el servidor.");
        console.error("Error de conexión:", error.request);
      } else {
        // Otro tipo de error
        toast.error("Algo salió mal al guardar el post.");
        console.error("Error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/posts/${params.postId}`);
      router.refresh();
      router.push("/dashboard/posts");
      toast.success("Post eliminado.");
    } catch (error: any) {
      console.error("Error al eliminar post:", error);

      if (error.response) {
        // Error con respuesta del servidor
        const status = error.response.status;
        const message = error.response.data || "Error desconocido";

        if (status === 404) {
          toast.error("El post no existe o ya fue eliminado.");
        } else if (status === 403) {
          toast.error("No tienes permisos para eliminar este post.");
        } else {
          toast.error(`Error: ${message}`);
        }

        console.error(`Error ${status}:`, message);
      } else if (error.request) {
        // Error de red sin respuesta
        toast.error("No se pudo conectar con el servidor.");
        console.error("Error de conexión:", error.request);
      } else {
        // Otro tipo de error
        toast.error("Algo salió mal al eliminar el post.");
        console.error("Error:", error.message);
      }
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
                    onChange={(url) => {
                      if (url && url.trim() !== "") {
                        console.log(
                          "Asignando nueva URL de imagen al post:",
                          url
                        );
                        field.onChange(url);
                      }
                    }}
                    onRemove={() => {
                      console.log("Eliminando imagen del post");
                      field.onChange("");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-8">
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="https://instagram.com/post/123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={loading}
                    placeholder="Descripción del post..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
