import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { ProviderForm } from "./components/provider-form";

export default async function ProviderPage({
  params,
}: {
  params: { providerId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const provider = await prismadb.provider.findUnique({
    where: {
      id: params.providerId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProviderForm initialData={provider} />
      </div>
    </div>
  );
}
