"use client";

import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Category, Product, Provider, Subcategory } from "@prisma/client";
import { useRouter } from "next/navigation";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  updateType: z.enum(["category", "subcategory", "provider", "product"]),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  providerId: z.string().optional(),
  productId: z.string().optional(),
  percentage: z.coerce.number().min(0.01).max(100),
});

type PriceUpdateFormValues = z.infer<typeof formSchema>;

interface PriceUpdateFormProps {
  categories: Category[];
  subcategories: Subcategory[];
  providers: Provider[];
  products: { id: string; name: string }[];
}

export const PriceUpdateForm: React.FC<PriceUpdateFormProps> = ({
  categories,
  subcategories,
  providers,
  products,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [filteredSubcategories, setFilteredSubcategories] =
    useState<Subcategory[]>(subcategories);
  const [affectedProducts, setAffectedProducts] = useState<number>(0);
  const [lastQueryString, setLastQueryString] = useState<string | null>(null);

  const form = useForm<PriceUpdateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      updateType: "category",
      percentage: 5,
    },
  });

  const updateType = form.watch("updateType");
  const categoryId = form.watch("categoryId");
  const subcategoryId = form.watch("subcategoryId");
  const providerId = form.watch("providerId");
  const productId = form.watch("productId");
  const percentage = form.watch("percentage");

  // Filtrar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    if (categoryId) {
      setFilteredSubcategories(
        subcategories.filter(
          (subcategory) => subcategory.categoryId === categoryId
        )
      );
      // Solo resetear subcategoryId si ya había uno seleccionado
      if (form.getValues("subcategoryId")) {
        form.setValue("subcategoryId", undefined);
      }
    } else {
      setFilteredSubcategories(subcategories);
    }
  }, [categoryId, subcategories, form]);

  // Calcular productos afectados cuando cambian los filtros
  useEffect(() => {
    // Simplificar la lógica para evitar problemas de estado
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    // Función para asegurarse de que el estado de carga se desactive después de un tiempo máximo
    const ensureLoadingResets = () => {
      if (isMounted) {
        // Forzar la desactivación del estado de carga después de 3 segundos como máximo
        setTimeout(() => {
          if (isMounted && previewLoading) {
            console.log("Forzando reset del estado de carga");
            setPreviewLoading(false);
          }
        }, 3000);
      }
    };

    const calculateAffectedProducts = async () => {
      // No hacer nada si no hay un tipo de actualización seleccionado
      if (!updateType) return;

      // Caso especial: si es un producto individual, sabemos que afecta a 1 producto
      if (updateType === "product" && productId) {
        if (isMounted) {
          setAffectedProducts(1);
          setPreviewLoading(false);
          setLastQueryString(`productId=${productId}`);
        }
        return;
      }

      // Verificar si hay criterios válidos para la consulta
      let hasValidCriteria = false;
      let queryParams = new URLSearchParams();

      if (updateType === "category" && categoryId) {
        queryParams.append("categoryId", categoryId);
        hasValidCriteria = true;
      } else if (updateType === "subcategory" && subcategoryId) {
        queryParams.append("subcategoryId", subcategoryId);
        hasValidCriteria = true;
      } else if (updateType === "provider" && providerId) {
        queryParams.append("providerId", providerId);
        hasValidCriteria = true;
      }

      // Si no hay criterios válidos, establecer productos afectados a 0 y salir
      if (!hasValidCriteria) {
        if (isMounted) {
          setAffectedProducts(0);
          setPreviewLoading(false);
        }
        return;
      }

      // Verificar si los parámetros son los mismos que la última consulta
      const queryString = queryParams.toString();
      if (lastQueryString === queryString) {
        if (isMounted && previewLoading) {
          setPreviewLoading(false);
        }
        return;
      }

      // Establecer el estado de carga y realizar la consulta
      if (isMounted) {
        setPreviewLoading(true);
        setLastQueryString(queryString);
        // Asegurar que el estado de carga se resetee eventualmente
        ensureLoadingResets();
      }

      queryParams.append("countOnly", "true");

      try {
        console.log(
          "Consultando productos afectados con:",
          queryParams.toString()
        );

        // Usar axios con un timeout explícito
        const response = await axios.get(
          `/api/price-updates/preview?${queryParams.toString()}`,
          {
            timeout: 8000, // 8 segundos de timeout
            validateStatus: function (status) {
              return status < 500; // Aceptar cualquier código de estado menor a 500
            },
          }
        );

        console.log("Respuesta de la API:", response.data);

        if (isMounted) {
          // Verificar si la respuesta contiene un error
          if (response.status !== 200 || response.data.error) {
            console.error("Error en la respuesta:", response.data);
            setAffectedProducts(0);
            setPreviewLoading(false);
            return;
          }

          setAffectedProducts(response.data.count);
          setPreviewLoading(false);
        }
      } catch (error: any) {
        console.error("Error calculating affected products:", error);
        if (isMounted) {
          setAffectedProducts(0);
          setPreviewLoading(false);

          if (error.code === "ECONNABORTED") {
            console.log("La consulta automática ha tardado demasiado tiempo.");
          }
        }
      }
    };

    // Usar un debounce para evitar múltiples llamadas rápidas
    timeoutId = setTimeout(() => {
      calculateAffectedProducts();
    }, 800); // Aumentar el tiempo de debounce para reducir las llamadas

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    updateType,
    categoryId,
    subcategoryId,
    providerId,
    productId,
    lastQueryString,
    previewLoading,
  ]);

  const onPreview = async () => {
    // Evitar múltiples clics o si ya está cargando
    if (previewLoading) return;

    // Función para asegurarse de que el estado de carga se desactive después de un tiempo máximo
    const ensureLoadingResets = () => {
      // Forzar la desactivación del estado de carga después de 5 segundos como máximo
      setTimeout(() => {
        setPreviewLoading(false);
      }, 5000);
    };

    try {
      setPreviewLoading(true);
      // Asegurar que el estado de carga se resetee eventualmente
      ensureLoadingResets();

      // Caso especial: si es un producto individual, sabemos que afecta a 1 producto
      if (updateType === "product" && productId) {
        setAffectedProducts(1);
        setLastQueryString(`productId=${productId}`);
        setPreviewLoading(false);
        toast.success("Se encontró 1 producto que coincide con los criterios.");
        return;
      }

      // Construir los parámetros de consulta
      let queryParams = new URLSearchParams();
      let hasValidCriteria = false;

      if (updateType === "category" && categoryId) {
        queryParams.append("categoryId", categoryId);
        hasValidCriteria = true;
      } else if (updateType === "subcategory" && subcategoryId) {
        queryParams.append("subcategoryId", subcategoryId);
        hasValidCriteria = true;
      } else if (updateType === "provider" && providerId) {
        queryParams.append("providerId", providerId);
        hasValidCriteria = true;
      }

      if (!hasValidCriteria) {
        toast.error("Por favor, seleccione los criterios de filtrado.");
        setPreviewLoading(false);
        return;
      }

      queryParams.append("countOnly", "true");

      console.log("Vista previa con parámetros:", queryParams.toString());

      // Realizar la consulta directamente con un timeout explícito
      try {
        const response = await axios.get(
          `/api/price-updates/preview?${queryParams.toString()}`,
          {
            timeout: 10000, // 10 segundos de timeout
            validateStatus: function (status) {
              return status < 500; // Aceptar cualquier código de estado menor a 500
            },
          }
        );

        console.log("Respuesta de vista previa:", response.data);

        // Verificar si la respuesta contiene un error
        if (response.status !== 200 || response.data.error) {
          console.error("Error en la respuesta:", response.data);
          toast.error(
            "Error al generar la vista previa. Por favor, intente con otros criterios."
          );
          setPreviewLoading(false);
          return;
        }

        // Actualizar el estado con los resultados
        setAffectedProducts(response.data.count);
        setLastQueryString(queryParams.toString());

        if (response.data.count > 0) {
          toast.success(
            `Se encontraron ${response.data.count} productos que coinciden con los criterios.`
          );
        } else {
          toast.error(
            "No se encontraron productos que coincidan con los criterios seleccionados."
          );
        }
      } catch (error: any) {
        console.error("Error al generar la vista previa:", error);

        if (error.code === "ECONNABORTED") {
          toast.error(
            "La consulta ha tardado demasiado tiempo. Por favor, intente con otros criterios."
          );
        } else {
          toast.error("Error al generar la vista previa.");
        }
      }
    } catch (error) {
      console.error("Error al generar la vista previa:", error);
      toast.error("Error al generar la vista previa.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const onSubmit = async (data: PriceUpdateFormValues) => {
    try {
      setLoading(true);

      // Construir el objeto de datos para la API
      const apiData = {
        updateType: data.updateType,
        percentage: data.percentage,
        filters: {
          categoryId:
            data.updateType === "category" ? data.categoryId : undefined,
          subcategoryId:
            data.updateType === "subcategory" ? data.subcategoryId : undefined,
          providerId:
            data.updateType === "provider" ? data.providerId : undefined,
          productId: data.updateType === "product" ? data.productId : undefined,
        },
      };

      await axios.post("/api/price-updates", apiData);

      toast.success(
        `Precios actualizados con éxito. ${affectedProducts} productos afectados.`
      );
      router.refresh();
    } catch (error: any) {
      toast.error("Algo salió mal al actualizar los precios.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Actualización de Precios"
          description="Aplica aumentos porcentuales a los precios de los productos"
        />
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="updateType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de actualización</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) =>
                            field.onChange(
                              value as
                                | "category"
                                | "subcategory"
                                | "provider"
                                | "product"
                            )
                          }
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="category" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Por Categoría
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="subcategory" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Por Subcategoría
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="provider" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Por Proveedor
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="product" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Producto Individual
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {updateType === "category" && (
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Categoría</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría" />
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
                )}

                {updateType === "subcategory" && (
                  <>
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Categoría (opcional)</FormLabel>
                          <Select
                            disabled={loading}
                            onValueChange={(value) => {
                              // Si se selecciona un valor vacío, establecerlo como undefined
                              field.onChange(value === "" ? undefined : value);
                            }}
                            value={field.value || ""}
                            defaultValue={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Filtrar por categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">
                                Todas las categorías
                              </SelectItem>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Filtra las subcategorías por categoría
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subcategoryId"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Subcategoría</FormLabel>
                          <Select
                            disabled={
                              loading || filteredSubcategories.length === 0
                            }
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar subcategoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredSubcategories.map((subcategory) => (
                                <SelectItem
                                  key={subcategory.id}
                                  value={subcategory.id}
                                >
                                  {subcategory.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {updateType === "provider" && (
                  <FormField
                    control={form.control}
                    name="providerId"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Proveedor</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                )}

                {updateType === "product" && (
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Producto</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Porcentaje de aumento</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="100"
                            disabled={loading}
                            placeholder="5"
                            {...field}
                          />
                          <span className="ml-2">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Ingrese el porcentaje de aumento (entre 0.01% y 100%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Resumen</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">
                      Tipo de actualización:
                    </p>
                    <p className="text-sm">
                      {updateType === "category" && "Por Categoría"}
                      {updateType === "subcategory" && "Por Subcategoría"}
                      {updateType === "provider" && "Por Proveedor"}
                      {updateType === "product" && "Producto Individual"}
                    </p>
                  </div>

                  {updateType === "category" && categoryId && (
                    <div>
                      <p className="text-sm font-medium">Categoría:</p>
                      <p className="text-sm">
                        {categories.find((c) => c.id === categoryId)?.name ||
                          "No seleccionada"}
                      </p>
                    </div>
                  )}

                  {updateType === "subcategory" && subcategoryId && (
                    <div>
                      <p className="text-sm font-medium">Subcategoría:</p>
                      <p className="text-sm">
                        {subcategories.find((s) => s.id === subcategoryId)
                          ?.name || "No seleccionada"}
                      </p>
                    </div>
                  )}

                  {updateType === "provider" && providerId && (
                    <div>
                      <p className="text-sm font-medium">Proveedor:</p>
                      <p className="text-sm">
                        {providers.find((p) => p.id === providerId)?.name ||
                          "No seleccionado"}
                      </p>
                    </div>
                  )}

                  {updateType === "product" && productId && (
                    <div>
                      <p className="text-sm font-medium">Producto:</p>
                      <p className="text-sm">
                        {products.find((p) => p.id === productId)?.name ||
                          "No seleccionado"}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium">
                      Porcentaje de aumento:
                    </p>
                    <p className="text-sm">{percentage}%</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm font-medium">Productos afectados:</p>
                    <p className="text-sm">
                      {previewLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        affectedProducts
                      )}
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Esta acción actualizará los precios de todos los productos
                      que coincidan con los criterios seleccionados.
                    </p>
                    {affectedProducts === 0 && (
                      <p className="text-sm text-red-500 mt-2">
                        No hay productos que coincidan con los criterios
                        seleccionados. Por favor, ajuste los filtros o haga clic
                        en &quot;Vista Previa&quot; para actualizar.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onPreview}
              disabled={
                loading ||
                previewLoading ||
                (updateType === "category" && !categoryId) ||
                (updateType === "subcategory" && !subcategoryId) ||
                (updateType === "provider" && !providerId) ||
                (updateType === "product" && !productId)
              }
            >
              {previewLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                "Vista Previa"
              )}
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                affectedProducts === 0 ||
                (updateType === "category" && !categoryId) ||
                (updateType === "subcategory" && !subcategoryId) ||
                (updateType === "provider" && !providerId) ||
                (updateType === "product" && !productId)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Aplicar Aumento"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};
