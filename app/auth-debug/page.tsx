"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AuthDebugPage() {
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/auth-debug");
        setAuthData(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al obtener datos de autenticación");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthData();
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Depuración de Autenticación</h1>

      {loading && (
        <p className="text-gray-500">
          Cargando información de autenticación...
        </p>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {authData && (
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Información de Autenticación
            </h2>
            <div className="space-y-2">
              <p>
                <strong>User ID:</strong> {authData.auth.userId}
              </p>
              <p>
                <strong>Session ID:</strong> {authData.auth.sessionId}
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Datos del Usuario</h2>
            <div className="space-y-2">
              <p>
                <strong>ID:</strong> {authData.user.id}
              </p>
              <p>
                <strong>Nombre:</strong> {authData.user.firstName}{" "}
                {authData.user.lastName}
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Metadatos</h2>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Public Metadata</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(authData.user.publicMetadata, null, 2)}
              </pre>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Private Metadata</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(authData.user.privateMetadata, null, 2)}
              </pre>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Unsafe Metadata</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(authData.user.unsafeMetadata, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Session Claims</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(authData.auth.sessionClaims, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
