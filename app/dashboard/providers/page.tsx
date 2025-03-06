import { format } from "date-fns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { ProvidersClient } from "./components/client";

export default async function ProvidersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const providers = await prismadb.provider.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProviders = providers.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(item.createdAt, "dd/MM/yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProvidersClient data={formattedProviders} />
      </div>
    </div>
  );
}
