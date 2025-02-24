import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import { OrderColumn } from "./components/columns";
import { OrderClient } from "./components/client";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
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

  const formattedOrders: OrderColumn[] = orders
    .map((item) => {
      const { emailAddress, name, deliveryOption, phone, address } =
        item.formData as any;
      return {
        id: item.id,
        emailAddress,
        name,
        deliveryOption,
        phone,
        address,
        products: item.orderItems
          .map((orderItem) => orderItem.product.name)
          .join(", "),
        totalPrice: formatter.format(
          item.orderItems.reduce((total, orderItem) => {
            return total + Number(orderItem.product.price);
          }, 0)
        ),
        isPaid: item.isPaid,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
        formData: item.formData,
      };
    })
    .filter(Boolean) as OrderColumn[];

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
