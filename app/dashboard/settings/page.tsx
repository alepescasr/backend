import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading
          title="Configuración"
          description="Administra la configuración de tu tienda"
        />
        <Separator />
        <div>{/* Aquí irá el contenido de la página de configuración */}</div>
      </div>
    </div>
  );
}
