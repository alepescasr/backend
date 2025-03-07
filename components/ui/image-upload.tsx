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

  const onUpload = (result: any) => {
    console.log("Cloudinary upload result:", result);
    onChange(result.info.secure_url);
    setIsUploading(false);
    toast.success("Imagen subida correctamente");
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
          maxFiles: 5,
          sources: ["local", "url", "camera"],
          resourceType: "image",
          publicId: `ecommerce-${Date.now()}`,
          folder: "ecommerce-admin",
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
              {isUploading ? "Subiendo..." : "Subir imagen"}
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
