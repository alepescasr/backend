import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ProvidersClient } from "./components/client";
import { ProviderColumn } from "./components/columns";

const ProvidersPage = async ({ params }: { params: { storeId: string } }) => {
  const providers = await prismadb.provider.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProviders: ProviderColumn[] = providers.map((item) => ({
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
};

export default ProvidersPage;
