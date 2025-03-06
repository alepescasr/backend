import prismadb from "@/lib/prismadb";
import mercadopago from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

mercadopago.configure({
  access_token: process.env.NEXT_ACCESS_TOKEN!,
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const {
      type,
      data: { id },
    } = await req.json();

    console.log(type, id);

    if (type == "payment") {
      const payment = await mercadopago.payment.findById(Number(id));
      if (payment.body.status == "approved") {
        const orderId = payment.body.external_reference;

        // Get the order with its items
        const order = await prismadb.order.findUnique({
          where: {
            id: orderId,
          },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        });

        if (order) {
          // Update order to paid
          await prismadb.order.update({
            where: {
              id: orderId,
            },
            data: {
              isPaid: true,
            },
          });

          // Decrease stock for each product in the order
          for (const item of order.orderItems) {
            const currentStock = item.product.stock;
            const quantityToReduce = item.quantity;

            // Only decrease if there's enough stock available
            if (currentStock > 0) {
              // Calculate new stock, ensuring it doesn't go below 0
              const newStock = Math.max(0, currentStock - quantityToReduce);

              await prismadb.product.update({
                where: {
                  id: item.product.id,
                },
                data: {
                  stock: newStock,
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { message: "An error ocurred", error: error.message },
      { headers: corsHeaders }
    );
  }
}
