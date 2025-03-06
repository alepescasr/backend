import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { formatter } from "@/lib/utils";

import prismadb from "@/lib/prismadb";

import { OrderClient } from "./components/client";

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

  const formattedOrders = orders.map((item) => ({
    id: item.id,
    formData: item.formData
      ? JSON.stringify(item.formData).substring(0, 50) + "..."
      : "No hay datos",
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
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
}
