"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MessageCircle, XCircle } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";

interface OrderItemType {
  id: string;
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  imageUrl: string;
}

interface ClientInfoType {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  comments: string;
  paymentMethod: string;
}

interface OrderDetailsProps {
  order: {
    id: string;
    isPaid: boolean;
    subtotal: string;
    shippingFee: string;
    total: string;
    createdAt: string;
    orderItems: OrderItemType[];
    clientInfo: ClientInfoType;
  };
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const router = useRouter();

  // Función para generar el enlace de WhatsApp
  const generateWhatsAppLink = () => {
    // Limpiar el número de teléfono (eliminar espacios, guiones, etc.)
    const cleanPhone = order.clientInfo.phone.replace(/\D/g, "");

    // Crear el mensaje preestablecido
    const message = `¡Hola ${order.clientInfo.name}! Tu compra en AlePesca por ${order.total} ha sido procesada correctamente. Te avisaremos cuando realicemos el envío. ¡Gracias por tu compra!`;

    // Codificar el mensaje para la URL
    const encodedMessage = encodeURIComponent(message);

    // Retornar el enlace completo
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading
          title={`Orden #${order.id.substring(0, 8)}...`}
          description={`Detalles de la orden realizada el ${order.createdAt}`}
        />
        <Badge variant={order.isPaid ? "default" : "destructive"}>
          {order.isPaid ? (
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Pagada
            </div>
          ) : (
            <div className="flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              No pagada
            </div>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sección de Información del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>Datos de contacto y envío</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm">Nombre completo</h4>
              <p>{order.clientInfo.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Email</h4>
              <p>{order.clientInfo.email}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Teléfono</h4>
              <p>{order.clientInfo.phone}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm">Dirección</h4>
              <p>{order.clientInfo.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm">Ciudad</h4>
                <p>{order.clientInfo.city}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">Provincia</h4>
                <p>{order.clientInfo.province}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Código Postal</h4>
              <p>{order.clientInfo.postalCode}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm">Método de Pago</h4>
              <p>{order.clientInfo.paymentMethod}</p>
            </div>
            {order.clientInfo.comments && (
              <div>
                <h4 className="font-semibold text-sm">Comentarios</h4>
                <p className="text-sm text-gray-600">
                  {order.clientInfo.comments}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar WhatsApp
              </Button>
            </a>
          </CardFooter>
        </Card>

        {/* Sección de Resumen de la Orden */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Orden</CardTitle>
            <CardDescription>Productos y costos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        fill
                        src={item.imageUrl}
                        alt={item.productName}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                          Sin imagen
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                    <p className="text-sm">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>{order.shippingFee}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{order.total}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => router.push("/dashboard/orders")}
              variant="outline"
              className="w-full"
            >
              Volver a la lista de órdenes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
