# Implementación del Cálculo de Envío en el Frontend

Este documento describe cómo implementar el cálculo dinámico de costo de envío en el frontend para la tienda de ecommerce.

## Arquitectura

El sistema permite calcular el costo de envío en el frontend y enviarlo al backend como parte del proceso de checkout.

### APIs Disponibles

1. **API de Consulta de Envío**: `GET /api/shipping?postalCode=XXXXX&provider=YYYY`

   - Parámetros:
     - `postalCode`: Código postal de entrega
     - `provider`: Proveedor de envío (opcional)
   - Respuesta: Información básica de envío para ese código postal

2. **API de Cálculo de Envío**: `POST /api/shipping`

   - Body:
     ```json
     {
       "postalCode": "1234",
       "provider": "standard",
       "weight": 1.5,
       "dimensions": {
         "length": 10,
         "width": 10,
         "height": 5
       }
     }
     ```
   - Respuesta: Costo de envío calculado

3. **API de Checkout**: `POST /api/checkout`
   - Ahora acepta el parámetro `shippingFee` para establecer el costo de envío

## Implementación en el Frontend

### 1. Formulario de Código Postal

Agrega un campo para ingresar el código postal en el formulario de checkout:

```tsx
// components/shipping-calculator.tsx
import { useState } from "react";
import axios from "axios";

interface ShippingCalculatorProps {
  onShippingCalculated: (fee: number) => void;
}

export const ShippingCalculator = ({
  onShippingCalculated,
}: ShippingCalculatorProps) => {
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateShipping = async () => {
    if (!postalCode) {
      setError("Por favor ingrese un código postal");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/shipping", {
        postalCode,
        provider: "standard",
      });

      const { shippingFee } = response.data;
      onShippingCalculated(shippingFee);
    } catch (error) {
      setError("Error al calcular el envío. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium">
          Código Postal
        </label>
        <div className="mt-1 flex">
          <input
            type="text"
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm"
            placeholder="Ej. 1234"
          />
          <button
            onClick={calculateShipping}
            disabled={isLoading}
            className="ml-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            {isLoading ? "Calculando..." : "Calcular"}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};
```

### 2. Integración en el Carrito

Modifica el componente de carrito para incluir el calculador de envío:

```tsx
// app/(routes)/cart/page.tsx
import { useState } from 'react';
import { ShippingCalculator } from '@/components/shipping-calculator';

const CartPage = () => {
  const [shippingFee, setShippingFee] = useState(2000); // Valor por defecto
  const subtotal = /* cálculo del subtotal */;
  const total = subtotal + shippingFee;

  const handleShippingCalculated = (fee: number) => {
    setShippingFee(fee);
  };

  const onCheckout = async () => {
    // ... resto del código de checkout
    const response = await axios.post('/api/checkout', {
      cartItems,
      orderFormData,
      shippingFee // Enviar el costo de envío calculado
    });
    // ... resto del código
  };

  return (
    <div>
      {/* ... resto del componente */}
      <div className="mt-6 space-y-4">
        <ShippingCalculator onShippingCalculated={handleShippingCalculated} />
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>
        <div className="flex justify-between">
          <p>Envío</p>
          <p>{formatPrice(shippingFee)}</p>
        </div>
        <div className="flex justify-between font-medium">
          <p>Total</p>
          <p>{formatPrice(total)}</p>
        </div>
      </div>
      <button onClick={onCheckout} className="w-full mt-6">
        Finalizar Compra
      </button>
    </div>
  );
};
```

### 3. Hooks para Cálculo de Envío

También puedes crear un hook para manejar la lógica de cálculo de envío:

```tsx
// hooks/use-shipping.ts
import { useState } from "react";
import axios from "axios";

interface ShippingParams {
  postalCode: string;
  provider?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export const useShipping = () => {
  const [shippingFee, setShippingFee] = useState(2000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const calculateShipping = async (params: ShippingParams) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/shipping", params);
      setShippingFee(response.data.shippingFee);
      return response.data.shippingFee;
    } catch (error) {
      setError("Error al calcular el envío");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    shippingFee,
    isLoading,
    error,
    calculateShipping,
  };
};
```

## Extensiones Futuras

### 1. Integraciones con Proveedores de Envío

Puedes integrar APIs reales de proveedores de envío como:

- MercadoEnvios
- Correo Argentino
- OCA
- Andreani

### 2. Cálculo Basado en Productos

Mejora el cálculo considerando:

- Peso total del carrito
- Dimensiones de los productos
- Distancia hasta el destino

### 3. Opciones de Envío

Ofrece diferentes opciones como:

- Envío estándar
- Envío express
- Retiro en tienda

## Notas Adicionales

- Asegúrate de manejar correctamente los errores en el frontend
- Valida el código postal antes de realizar el cálculo
- Utiliza imágenes y elementos visuales para mejorar la experiencia de usuario
- Considera agregar una estimación del tiempo de entrega junto con el costo
