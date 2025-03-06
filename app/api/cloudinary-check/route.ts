import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Verificar que las variables de entorno estén configuradas
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName) {
      return NextResponse.json(
        {
          error: "Cloudinary cloud name no está configurado",
          instructions:
            "Debes configurar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME en tu archivo .env",
        },
        { status: 400 }
      );
    }

    // Información para el usuario
    return NextResponse.json({
      status: "Configuración detectada",
      cloudName,
      nextSteps: [
        "1. Crea una cuenta en Cloudinary si aún no tienes una",
        "2. Ve a Settings > Upload en el dashboard de Cloudinary",
        "3. Desplázate hasta 'Upload presets'",
        "4. Crea un nuevo preset con 'Signing Mode' configurado como 'Unsigned'",
        "5. Copia el nombre del preset y úsalo en tu componente image-upload.tsx",
        "6. Asegúrate de que tu Cloud Name en .env coincida con el de tu cuenta",
      ],
    });
  } catch (error) {
    console.error("Error al verificar Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
