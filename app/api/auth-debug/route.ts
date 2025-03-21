import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";

export async function GET() {
  try {
    // Obtener sesión actual
    const { userId, sessionId, sessionClaims } = auth();

    // Obtener datos del usuario actual
    const user = await currentUser();

    return NextResponse.json({
      message: "Auth Debug Info",
      auth: {
        userId,
        sessionId,
        sessionClaims,
      },
      user: {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        emailAddresses: user?.emailAddresses,
        publicMetadata: user?.publicMetadata,
        privateMetadata: user?.privateMetadata,
        unsafeMetadata: user?.unsafeMetadata,
      },
    });
  } catch (error) {
    console.error("[AUTH_DEBUG]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
