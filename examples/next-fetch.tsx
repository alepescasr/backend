/**
 * EJEMPLOS PARA SOLUCIONAR EL ERROR DE DYNAMIC SERVER USAGE EN NEXT.JS
 *
 * Este archivo muestra diferentes formas de hacer fetch a una API externa
 * desde componentes del servidor en Next.js sin causar el error:
 * "DynamicServerError: Dynamic server usage: no-store fetch"
 */

// =================== SOLUCIÓN 1: DESDE UN COMPONENTE SERVIDOR ===================

// Ejemplo para /about/page.tsx o cualquier otro Server Component
export async function fetchCategories() {
  // El error ocurre porque por defecto, fetch en Server Components se ejecuta
  // durante la compilación, no en tiempo de ejecución. Debemos forzar que sea dinámico.

  // OPCIÓN 1: Usar la opción { cache: 'no-store' }
  const response = await fetch(
    "https://ciro-ecommerce-admin.vercel.app/api/categories",
    {
      cache: "no-store", // IMPORTANTE: Esta es la línea clave para evitar el error
    }
  );

  if (!response.ok) {
    console.error("Error fetching categories:", response.status);
    return [];
  }

  return response.json();
}

// Para usar en un Server Component:
/* 
import { fetchCategories } from '@/examples/next-fetch';

export default async function AboutPage() {
  // Esta llamada no causará el error porque estamos usando cache: 'no-store'
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

// =================== SOLUCIÓN 2: USANDO NEXT.JS SEGMENT CONFIG ===================

// Otra forma de solucionar el problema es usando la config de segmento
export const dynamic = "force-dynamic"; // Esto hace que toda la página sea dinámica

export async function fetchCategoriesWithConfig() {
  // Con la configuración 'force-dynamic' a nivel de página o layout,
  // esta llamada ya no necesita { cache: 'no-store' }
  const response = await fetch(
    "https://ciro-ecommerce-admin.vercel.app/api/categories"
  );

  if (!response.ok) {
    console.error("Error fetching categories:", response.status);
    return [];
  }

  return response.json();
}

// =================== SOLUCIÓN 3: USANDO UN COMPONENTE CLIENTE ===================

/* 
'use client';

import { useEffect, useState } from 'react';

export function ClientCategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('https://ciro-ecommerce-admin.vercel.app/api/categories');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCategories();
  }, []);
  
  if (loading) return <p>Cargando categorías...</p>;
  
  return (
    <ul>
      {categories.map((category) => (
        <li key={category.id}>{category.name}</li>
      ))}
    </ul>
  );
}
*/

// =================== SOLUCIÓN 4: USANDO LA API ROUTES DE NEXT.JS ===================

// Otra solución es crear una API Route en tu proyecto que actúe como proxy
// En /app/api/proxy/categories/route.ts:

/*
import { NextResponse } from 'next/server';

export async function GET() {
  const response = await fetch('https://ciro-ecommerce-admin.vercel.app/api/categories', {
    cache: 'no-store',
  });
  
  const data = await response.json();
  
  return NextResponse.json(data);
}
*/

// Luego usas tu propio endpoint en lugar del externo:
export async function fetchCategoriesViaProxy() {
  const response = await fetch("/api/proxy/categories");

  if (!response.ok) {
    console.error("Error fetching categories via proxy:", response.status);
    return [];
  }

  return response.json();
}
