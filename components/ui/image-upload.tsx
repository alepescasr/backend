"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Función para extraer el ID de una URL de Cloudinary
  const extractImageId = (url: string): string => {
    // Extraer solo el nombre del archivo sin parámetros
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    return filename;
  };

  // Función para verificar si una imagen ya existe por su contenido (no por URL exacta)
  const isDuplicateImage = (
    newUrl: string,
    existingUrls: string[]
  ): boolean => {
    if (!newUrl) return false;

    // Para URLs que no son de Cloudinary, usar comparación exacta
    if (!newUrl.includes("cloudinary")) {
      return existingUrls.includes(newUrl);
    }

    // Para URLs de Cloudinary, extraer el ID y comparar
    const newId = extractImageId(newUrl);

    // Si el ID es muy corto, podría ser un formato diferente, usar la comparación completa
    if (newId.length < 5) {
      return existingUrls.includes(newUrl);
    }

    // Verificar si alguno de los IDs existentes coincide
    return existingUrls.some((existingUrl) => {
      const existingId = extractImageId(existingUrl);
      return existingId === newId;
    });
  };

  const onUpload = (result: any) => {
    console.log("Cloudinary upload result:", result);
    // Verificar si se subieron múltiples archivos o uno solo
    if (Array.isArray(result.info.secure_url)) {
      // Múltiples archivos
      result.info.secure_url.forEach((url: string) => {
        if (!isDuplicateImage(url, value)) {
          onChange(url);
          toast.success("Imagen subida correctamente");
        } else {
          toast.error("Una de las imágenes ya fue subida anteriormente");
        }
      });
    } else {
      // Un solo archivo
      const newUrl = result.info.secure_url;

      if (isDuplicateImage(newUrl, value)) {
        toast.error("Esta imagen ya ha sido subida");
      } else {
        onChange(newUrl);
        toast.success("Imagen subida correctamente");
      }
    }
    setIsUploading(false);
  };

  const onError = (error: any) => {
    console.error("Error al subir imagen:", error);
    setIsUploading(false);
    toast.error("Error al subir la imagen. Por favor, intenta de nuevo.");
  };

  if (!isMounted) {
    return null;
  }

  if (!cloudName) {
    return (
      <div className="p-4 text-red-500 border border-red-500 rounded-md">
        Error: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado en las
        variables de entorno.
      </div>
    );
  }

  const uniqueUploadId = `ecommerce-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>
      <CldUploadWidget
        onUpload={onUpload}
        onError={onError}
        uploadPreset="ecommerce_unsigned"
        options={{
          maxFiles: 5, // Aumentar a 5 imágenes a la vez
          sources: ["local", "url", "camera"],
          resourceType: "image",
          publicId: uniqueUploadId,
          folder: "ecommerce-admin",
          clientAllowedFormats: ["png", "gif", "jpeg", "jpg", "webp"],
          maxFileSize: 10000000,
          multiple: true, // Habilitar selección múltiple
        }}
      >
        {({ open }) => {
          const onClick = () => {
            setIsUploading(true);
            open();
          };
          return (
            <Button
              type="button"
              disabled={disabled || isUploading}
              variant="secondary"
              onClick={onClick}
            >
              <ImagePlus className="h-4 w-4 mr-2" />
              {isUploading ? "Subiendo..." : "Subir imágenes"}
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
