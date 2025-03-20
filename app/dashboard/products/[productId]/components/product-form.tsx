"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Category,
  Image,
  Product,
  Provider,
  Subcategory,
  Color,
} from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/ui/image-upload";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(1),
  nameTag: z.string().min(1),
  description: z.string().min(1),
  images: z.object({ url: z.string() }).array(),
  price: z.coerce.number().min(1),
  offerPrice: z.coerce.number().min(1).optional(),
  code: z.string().optional(),
  calibration: z.string().optional(),
  costPrice: z.coerce.number().min(0).optional(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  providerId: z.string().optional(),
  stock: z.coerce.number().min(0).default(0),
  colorId: z.string().optional(),
  weight: z.coerce.number().optional(),
  attributes: z.any().optional(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  hasOffer: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData:
    | (Omit<Product, "price" | "offerPrice" | "createdAt" | "updatedAt"> & {
        images: Image[];
        price: string;
        offerPrice: string | null;
        costPrice?: string | null;
        code?: string | null;
        calibration?: string | null;
        createdAt: string;
        updatedAt: string;
        color?: Color | null;
      })
    | null;
  categories: Category[];
  subcategories: Subcategory[];
  providers: Provider[];
  colors: Color[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  subcategories,
  providers,
  colors,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.categoryId || ""
  );
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >(
    initialData?.categoryId
      ? subcategories.filter(
          (subcategory) => subcategory.categoryId === initialData.categoryId
        )
      : subcategories
  );

  // Estado para los atributos personalizados
  const [categoryAttributes, setCategoryAttributes] = useState<
    Record<string, any>
  >((initialData?.attributes as Record<string, any>) || {});

  // Función para actualizar los atributos personalizados
  const updateCategoryAttribute = (key: string, value: any) => {
    setCategoryAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Actualizar el formulario con los nuevos atributos
    form.setValue("attributes", {
      ...categoryAttributes,
      [key]: value,
    });
  };

  const title = initialData ? "Editar producto" : "Crear producto";
  const description = initialData
    ? "Editar un producto."
    : "Añadir un nuevo producto";
  const toastMessage = initialData
    ? "Producto actualizado."
    : "Producto creado.";
  const action = initialData ? "Guardar cambios" : "Crear";

  const defaultValues = initialData
    ? {
        ...initialData,
        price: parseFloat(String(initialData?.price)),
        offerPrice: initialData?.offerPrice
          ? parseFloat(String(initialData.offerPrice))
          : undefined,
        costPrice: initialData?.costPrice
          ? parseFloat(String(initialData.costPrice))
          : undefined,
        code: initialData.code || undefined,
        calibration: initialData.calibration || undefined,
        providerId: initialData.providerId || undefined,
        colorId: initialData.colorId || undefined,
        stock: initialData.stock || 0,
        weight: initialData.weight === null ? undefined : initialData.weight,
      }
    : {
        name: "",
        nameTag: "",
        description: "",
        images: [],
        price: 0,
        offerPrice: undefined,
        code: undefined,
        calibration: undefined,
        costPrice: undefined,
        categoryId: "",
        subcategoryId: "",
        providerId: undefined,
        colorId: undefined,
        stock: 0,
        weight: undefined,
        attributes: {},
        isFeatured: false,
        isArchived: false,
        hasOffer: false,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/products/${params!.productId}`, data);
      } else {
        await axios.post(`/api/products`, data);
      }
      router.refresh();
      router.push(`/dashboard/products`);
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
      await axios.delete(`/api/products/${params!.productId}`);
      router.refresh();
      router.push(`/dashboard/products`);
      toast.success("Producto eliminado.");
    } catch (error: any) {
      toast.error("Algo salió mal.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    form.setValue("categoryId", categoryId);
    form.setValue("subcategoryId", ""); // Reset subcategory when category changes

    // Filter subcategories based on selected category
    const filtered = subcategories.filter(
      (subcategory) => subcategory.categoryId === categoryId
    );
    setFilteredSubcategories(filtered);

    // Definir atributos específicos según la categoría seleccionada
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (selectedCategory) {
      // Reiniciar los atributos
      let newAttributes: Record<string, any> = {};

      // Configurar atributos según la categoría
      switch (selectedCategory.name.toLowerCase()) {
        case "ropa":
          newAttributes = {
            talla: "",
            material: "",
            instruccionesLavado: "",
          };
          break;
        case "electrónica":
          newAttributes = {
            voltaje: "",
            garantía: "",
            dimensiones: "",
          };
          break;
        case "alimentos":
          newAttributes = {
            fechaCaducidad: "",
            ingredientes: "",
            informaciónNutricional: "",
          };
          break;
        // Añadir más categorías según sea necesario
        default:
          // Categoría sin atributos específicos
          break;
      }

      // Actualizar el estado y el formulario
      setCategoryAttributes(newAttributes);
      form.setValue("attributes", newAttributes);
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
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imágenes</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) =>
                      field.onChange([...field.value, { url }])
                    }
                    onRemove={(url) =>
                      field.onChange([
                        ...field.value.filter((current) => current.url !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre del producto"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre para URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="nombre-del-producto"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este nombre se usará en la URL del producto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="10"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Cantidad de unidades disponibles
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="COD123"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Código de referencia del producto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calibration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calibración (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="10gr o 5mm"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Calibración en gramos (gr) o milímetros (mm)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de costo (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={loading}
                      placeholder="5.99"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Precio de costo del producto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (opcional)</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Seleccionar color"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin color</SelectItem>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-x-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.name}
                          </div>
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
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      disabled={loading}
                      placeholder="0.5"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Peso del producto en kilogramos (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Atributos específicos de categoría */}
            {Object.keys(categoryAttributes).length > 0 && (
              <div className="col-span-3">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-4">
                    Atributos específicos de categoría
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(categoryAttributes).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-sm font-medium">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <Input
                          value={value || ""}
                          onChange={(e) =>
                            updateCategoryAttribute(key, e.target.value)
                          }
                          placeholder={`Ingrese ${key}`}
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => handleCategoryChange(value)}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Seleccionar categoría"
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
              name="subcategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subcategoría</FormLabel>
                  <Select
                    disabled={loading || !selectedCategoryId}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Seleccionar subcategoría"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
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
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor (opcional)</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Seleccionar proveedor"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Sin proveedor</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
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
              name="hasOffer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore - Type mismatch between react-hook-form and Checkbox component
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tiene oferta</FormLabel>
                    <FormDescription>
                      Este producto tendrá un precio de oferta
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {form.watch("hasOffer") && (
              <FormField
                control={form.control}
                name="offerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de oferta</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={loading}
                        placeholder="7.99"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore - Type mismatch between react-hook-form and Checkbox component
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Destacado</FormLabel>
                    <FormDescription>
                      Este producto aparecerá en la página principal
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      // @ts-ignore - Type mismatch between react-hook-form and Checkbox component
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Archivado</FormLabel>
                    <FormDescription>
                      Este producto no aparecerá en la tienda
                    </FormDescription>
                  </div>
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
                    placeholder="Descripción del producto"
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
