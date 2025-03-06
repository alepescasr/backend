import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // En esta versión de la aplicación, no usamos el modelo Store
  // Simplemente renderizamos el contenido sin verificar la tienda
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
