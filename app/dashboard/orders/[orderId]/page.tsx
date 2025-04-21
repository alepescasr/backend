import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";

import { OrderDetails } from "./components/order-details";

export default async function OrderPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    redirect("/dashboard/orders");
  }

  // Procesamos los datos del formulario del cliente
  let clientInfo = null;
  let paymentMethod = "No especificado";

  try {
    if (order.formData) {
      const data =
        typeof order.formData === "string"
          ? JSON.parse(order.formData as string)
          : order.formData;

      clientInfo = data.clientInfo || {};

      // Extraer método de pago del objeto formData
      if (data.paymentMethod) {
        paymentMethod = data.paymentMethod;
        console.log("Método de pago encontrado en formData:", paymentMethod);
      }
    }
  } catch (error) {
    console.error("Error procesando datos del cliente:", error);
    clientInfo = {}; // Si hay error, inicializamos como objeto vacío
  }

  // Calcula el total de los productos
  const subtotal = order.orderItems.reduce((total, item) => {
    return total + Number(item.product.price) * item.quantity;
  }, 0);

  // Datos formateados para el componente
  const orderData = {
    id: order.id,
    isPaid: order.isPaid,
    paymentMethod: paymentMethod,
    subtotal: formatter.format(subtotal),
    shippingFee: formatter.format(Number(order.shippingFee)),
    total: formatter.format(
      Number(order.totalAmount || subtotal + Number(order.shippingFee))
    ),
    createdAt: format(order.createdAt, "dd/MM/yyyy HH:mm"),
    orderItems: order.orderItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      price: formatter.format(Number(item.product.price)),
      quantity: item.quantity,
      imageUrl: item.product.images[0]?.url || "",
    })),
    clientInfo: {
      name:
        `${clientInfo?.nombre || ""} ${clientInfo?.apellido || ""}`.trim() ||
        "No disponible",
      email: clientInfo?.email || "No disponible",
      phone: clientInfo?.telefono || "No disponible",
      address: clientInfo?.direccion || "No disponible",
      city: clientInfo?.ciudad || "No disponible",
      province: clientInfo?.provincia || "No disponible",
      postalCode: clientInfo?.codigoPostal || "No disponible",
      comments: clientInfo?.comentarios || "Sin comentarios",
      paymentMethod: paymentMethod,
    },
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderDetails order={orderData} />
      </div>
    </div>
  );
}
