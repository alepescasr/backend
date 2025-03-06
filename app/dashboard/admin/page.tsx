"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);

  const handleSetAdminRole = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/admin/set-admin-role");
      toast.success("Rol de administrador asignado correctamente");
      console.log("Respuesta:", response.data);
    } catch (error) {
      console.error("Error al asignar rol de administrador:", error);
      toast.error("Error al asignar rol de administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <h1 className="text-2xl font-bold">Administración</h1>
        <p className="mb-4">
          Esta página te permite asignar el rol de administrador a tu usuario
          actual.
        </p>
        <Button onClick={handleSetAdminRole} disabled={loading}>
          {loading ? "Asignando..." : "Asignar rol de administrador"}
        </Button>
      </div>
    </div>
  );
}
