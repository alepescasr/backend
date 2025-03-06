import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { ProviderForm } from "../[providerId]/components/provider-form";

export default async function NewProviderPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProviderForm initialData={null} />
      </div>
    </div>
  );
}
