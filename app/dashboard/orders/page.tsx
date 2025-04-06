import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { formatter } from "@/lib/utils";

import prismadb from "@/lib/prismadb";

import { OrderClient } from "./components/client";

// Función para extraer información del cliente del JSON
const extractClientInfo = (formData: any) => {
  if (!formData) return { name: "No disponible", email: "No disponible" };

  try {
    // Parsear el formData si es una cadena
    const data = typeof formData === "string" ? JSON.parse(formData) : formData;

    // Extraer la información del cliente
    const clientInfo = data.clientInfo || {};
    const name = `${clientInfo.nombre || ""} ${
      clientInfo.apellido || ""
    }`.trim();
    const email = clientInfo.email || "No disponible";
    const phone = clientInfo.telefono || "No disponible";

    return {
      name: name || "Sin nombre",
      email,
      phone,
    };
  } catch (error) {
    console.error("Error al procesar los datos del cliente:", error);
    return {
      name: "Error en datos",
      email: "Error en datos",
      phone: "Error en datos",
    };
  }
};

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const orders = await prismadb.order.findMany({
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedOrders = orders.map((item) => {
    // Extraer la información del cliente
    const clientInfo = extractClientInfo(item.formData);

    return {
      id: item.id,
      formData: item.formData ? JSON.stringify(item.formData) : "No hay datos",
      clientName: clientInfo.name,
      clientEmail: clientInfo.email,
      clientPhone: clientInfo.phone,
      products: item.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      totalPrice: formatter.format(
        item.orderItems.reduce((total, item) => {
          return total + Number(item.product.price);
        }, 0)
      ),
      isPaid: item.isPaid,
      createdAt: format(item.createdAt, "dd/MM/yyyy"),
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
}
