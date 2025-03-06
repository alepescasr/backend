import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    // Asignar el rol de administrador al usuario actual
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "admin" },
    });

    return NextResponse.json({
      success: true,
      message: "Rol de administrador asignado correctamente",
      userId: userId,
    });
  } catch (error) {
    console.error("[SET_ADMIN_ROLE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
