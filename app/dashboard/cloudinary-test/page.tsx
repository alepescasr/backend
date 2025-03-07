"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Card, CardContent } from "@/components/ui/card";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-hot-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

export default function CloudinaryTestPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [cloudinaryConfig, setCloudinaryConfig] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});
  const [customPreset, setCustomPreset] = useState("");

  useEffect(() => {
    const checkCloudinary = async () => {
      try {
        const response = await fetch("/api/cloudinary-check");
        const data = await response.json();
        setCloudinaryConfig(data);
      } catch (error) {
        console.error("Error al verificar Cloudinary:", error);
        toast.error("Error al verificar la configuración de Cloudinary");
      } finally {
        setIsLoading(false);
      }
    };

    checkCloudinary();
  }, []);

  const onUploadSuccess = (preset: string) => (result: any) => {
    console.log(`Upload success with preset ${preset}:`, result);
    setTestResults((prev: any) => ({
      ...prev,
      [preset]: { success: true, url: result.info.secure_url },
    }));
    toast.success(`Imagen subida correctamente con preset: ${preset}`);
  };

  const onUploadError = (preset: string) => (error: any) => {
    console.error(`Upload error with preset ${preset}:`, error);
    setTestResults((prev: any) => ({
      ...prev,
      [preset]: { success: false, error },
    }));
    toast.error(`Error al subir imagen con preset: ${preset}`);
  };

  const testPresets = ["ecommerce_unsigned", customPreset].filter(Boolean);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Diagnóstico de Cloudinary"
          description="Herramienta para verificar y solucionar problemas con Cloudinary"
        />
        <Separator />

        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Verificando configuración de Cloudinary...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">
                  Configuración detectada
                </h2>
                {cloudinaryConfig ? (
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Cloud Name:</span>{" "}
                      {cloudinaryConfig.cloudName || "No configurado"}
                    </p>
                    <p>
                      <span className="font-medium">Estado de conexión:</span>{" "}
                      {cloudinaryConfig.pingStatus === "OK" ? (
                        <span className="text-green-500 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Conectado
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> Error de conexión
                        </span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500">
                    No se pudo obtener la configuración de Cloudinary
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Prueba de carga de imágenes
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">
                      Probar con preset personalizado
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={customPreset}
                        onChange={(e) => setCustomPreset(e.target.value)}
                        placeholder="Nombre del preset"
                        className="p-2 border rounded"
                      />
                      <Button
                        disabled={!customPreset}
                        variant="secondary"
                        onClick={() => {
                          setTestResults((prev: any) => ({
                            ...prev,
                            [customPreset]: { testing: true },
                          }));
                        }}
                      >
                        Añadir
                      </Button>
                    </div>
                  </div>

                  {testPresets.map((preset) => (
                    <div key={preset} className="border p-4 rounded-md">
                      <h3 className="font-medium mb-2">Preset: {preset}</h3>

                      {testResults[preset]?.testing ||
                      testResults[preset]?.success === false ? (
                        <div className="mb-4">
                          <CldUploadWidget
                            onUpload={onUploadSuccess(preset)}
                            onError={onUploadError(preset)}
                            uploadPreset={preset}
                            options={{
                              maxFiles: 1,
                              sources: ["local"],
                              resourceType: "image",
                              publicId: `test-${Date.now()}`,
                              folder: "test",
                            }}
                          >
                            {({ open }) => (
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => open()}
                              >
                                Probar carga
                              </Button>
                            )}
                          </CldUploadWidget>
                        </div>
                      ) : null}

                      {testResults[preset]?.success === true && (
                        <div className="mt-2">
                          <p className="text-green-500 flex items-center mb-2">
                            <CheckCircle className="h-4 w-4 mr-1" /> Carga
                            exitosa
                          </p>
                          <div className="w-[200px] h-[200px] relative">
                            <Image
                              src={testResults[preset].url}
                              alt="Uploaded"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        </div>
                      )}

                      {testResults[preset]?.success === false && (
                        <div className="mt-2">
                          <p className="text-red-500 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> Error de carga
                          </p>
                          <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-auto max-h-[100px]">
                            {JSON.stringify(testResults[preset].error, null, 2)}
                          </pre>
                        </div>
                      )}

                      {!testResults[preset] && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setTestResults((prev: any) => ({
                              ...prev,
                              [preset]: { testing: true },
                            }));
                          }}
                        >
                          Iniciar prueba
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">
                  Solución de problemas
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  {cloudinaryConfig?.troubleshooting?.map(
                    (tip: string, index: number) => (
                      <li key={index}>{tip}</li>
                    )
                  )}
                  <li>
                    Verifica que tu cuenta de Cloudinary esté activa y no haya
                    alcanzado los límites de uso.
                  </li>
                  <li>
                    Asegúrate de que el preset <code>ecommerce_unsigned</code>{" "}
                    exista y esté configurado como <code>Unsigned</code>.
                  </li>
                  <li>
                    Si continúas teniendo problemas, prueba crear un nuevo
                    preset con un nombre diferente y actualiza el componente{" "}
                    <code>image-upload.tsx</code>.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
