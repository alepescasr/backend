"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Ejemplo 1: Usando useEffect (cliente) - Funciona en cualquier componente cliente
export function ClientFetchExample() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Usa axios o fetch con la URL completa
        const response = await axios.get(
          "https://ciro-ecommerce-admin.vercel.app/api/categories"
        );
        setCategories(response.data);
        setError(null);
      } catch (err: any) {
        console.error("Error al obtener categorías:", err);
        setError(err.message || "Error al cargar categorías");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Categorías</h2>
      <ul>
        {categories.map((category: any) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}

// --------------------- CÓDIGO PARA TU PROYECTO STORE ----------------------
// Ejemplo para usar en tu proyecto store cuando quieras llamar a la API del admin

// 1. En cualquier archivo que necesite hacer fetch desde el servidor (Next.js):
export async function fetchCategories() {
  try {
    const response = await fetch(
      "https://ciro-ecommerce-admin.vercel.app/api/categories",
      {
        cache: "no-store", // Esto es crucial para evitar el error DynamicServerError
        // O alternativamente usar next.revalidate = 0 para datos que pueden cambiar
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// 2. Si necesitas usarlo en un componente de servidor:
/*
// En un archivo page.tsx o layout.tsx (Server Component)
import { fetchCategories } from './utils/api';

export default async function Page() {
  const categories = await fetchCategories();
  
  return (
    <div>
      <h1>Categorías</h1>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}
*/
