"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error en la consola para depuración
    console.error("Productos - Error:", error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center text-2xl font-bold">¡Algo salió mal!</h2>
      <p className="mt-2 text-gray-500">
        {error.message || "Ocurrió un error al cargar los productos."}
      </p>
      {error.digest && (
        <p className="mt-1 text-sm text-gray-400">Digest: {error.digest}</p>
      )}
      <Button className="mt-4" onClick={() => reset()}>
        Intentar de nuevo
      </Button>
    </main>
  );
}
