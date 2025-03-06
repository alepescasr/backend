import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ya no buscamos el store porque hemos cambiado a un modelo de base de datos compartida
  // Simplemente renderizamos los children
  return <>{children}</>;
}
