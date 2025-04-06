import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";

import { BillboardForm } from "../components/billboard-form";

export default async function NewBillboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if already have 3 billboards
  const billboardCount = await prismadb.billboard.count();
  const hasReachedLimit = billboardCount >= 3;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {hasReachedLimit ? (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
            role="alert"
          >
            <p className="font-bold">Límite alcanzado</p>
            <p>
              No se pueden crear más de 3 billboards. Por favor, elimine uno
              existente antes de crear uno nuevo.
            </p>
          </div>
        ) : (
          <BillboardForm initialData={null} />
        )}
      </div>
    </div>
  );
}
