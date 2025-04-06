import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { BillboardClient } from "./components/client";

export default async function BillboardsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const billboards = await prismadb.billboard.findMany({
    orderBy: {
      order: "asc",
    },
  });

  const formattedBillboards = billboards.map((item) => ({
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    isActive: item.isActive,
    order: item.order,
    createdAt: format(item.createdAt, "dd/MM/yyyy"),
  }));

  // Check if we're at the limit
  const atLimit = billboards.length >= 3;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} atLimit={atLimit} />
      </div>
    </div>
  );
}
