# Guía de Integración: Tienda con Panel de Administración

Esta guía explica cómo conectar correctamente tu tienda (frontend) con el panel de administración (backend) para consumir los datos de la API.

## Problema: Error `DynamicServerError` en Next.js 14

Si estás experimentando errores como:

```
DynamicServerError: Dynamic server usage: no-store fetch https://ciro-ecommerce-admin.vercel.app/api/categories
```

Este error ocurre porque estás intentando hacer un fetch desde un componente de servidor en Next.js sin especificar las opciones correctas de caché.

## Solución

### 1. Desde un Componente de Servidor (Server Component)

Si necesitas hacer la llamada desde un componente del servidor (archivo `page.tsx`, `layout.tsx` u otro Server Component):

```typescript
// utils/api.ts
export async function fetchCategories() {
  try {
    const response = await fetch(
      "https://ciro-ecommerce-admin.vercel.app/api/categories",
      {
        cache: "no-store", // Opción 1: Evita el almacenamiento en caché
        // Opción 2: Revalidar cada cierto tiempo (en segundos)
        // next: { revalidate: 60 } // Revalidar cada 60 segundos
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

// En tu componente de servidor (page.tsx)
import { fetchCategories } from "../utils/api";

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return <div>{/* Renderizar las categorías */}</div>;
}
```

### 2. Desde un Componente de Cliente (Client Component)

Si estás haciendo la llamada desde un componente de cliente (con 'use client'), puedes usar `useEffect` y `fetch` o una librería como `axios`:

```typescript
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function CategoriesClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://ciro-ecommerce-admin.vercel.app/api/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return <div>{/* Renderizar las categorías */}</div>;
}
```

## Recomendaciones Generales

1. **Para datos que cambian con frecuencia**: Usa `cache: 'no-store'` para obtener siempre datos frescos.
2. **Para datos que cambian poco**: Usa `next: { revalidate: X }` donde X es el tiempo en segundos.
3. **Para llamadas autenticadas o personalizadas**: Preferiblemente hazlas desde componentes cliente.
4. **Manejo de errores**: Siempre implementa un buen manejo de errores y estados de carga.

## CORS y Conexión entre Dominios

Si experimentas problemas de CORS (Cross-Origin Resource Sharing), asegúrate de que tu API permita solicitudes desde el dominio de tu tienda:

1. En el panel de administración, agrega los dominios permitidos para CORS.
2. Para desarrollo local, añade `http://localhost:3000` a los dominios permitidos.

## Problemas Comunes y Soluciones

| Problema                   | Solución                                                              |
| -------------------------- | --------------------------------------------------------------------- |
| Error `DynamicServerError` | Usar `cache: 'no-store'` o `next: { revalidate: X }`                  |
| Error CORS                 | Configurar correctamente CORS en el backend                           |
| Datos obsoletos            | Usar `cache: 'no-store'` para obtener datos frescos                   |
| Demasiadas solicitudes     | Implementar caché con revalidación mediante `next: { revalidate: X }` |
