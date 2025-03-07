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

    // Verificar si podemos hacer una solicitud básica a Cloudinary
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/ping`
      );
      const pingStatus = response.ok ? "OK" : "Error";

      // Información para el usuario
      return NextResponse.json({
        status: "Configuración detectada",
        cloudName,
        pingStatus,
        nextSteps: [
          "1. Crea una cuenta en Cloudinary si aún no tienes una",
          "2. Ve a Settings > Upload en el dashboard de Cloudinary",
          "3. Desplázate hasta 'Upload presets'",
          "4. Crea un nuevo preset llamado 'ecommerce_unsigned' con 'Signing Mode' configurado como 'Unsigned'",
          "5. Asegúrate de que tu Cloud Name en .env coincida con el de tu cuenta",
          "6. Verifica que tu cuenta de Cloudinary tenga suficientes créditos para cargas sin firmar",
        ],
        troubleshooting: [
          "- Si ves errores 401 (Unauthorized), verifica que el preset 'ecommerce_unsigned' exista y esté configurado como 'Unsigned'",
          "- Asegúrate de que el nombre del cloud en .env sea exactamente igual al de tu cuenta de Cloudinary",
          "- Verifica que no haya restricciones de CORS en tu cuenta de Cloudinary",
          "- Prueba crear un nuevo preset con un nombre diferente y actualiza el componente image-upload.tsx",
        ],
      });
    } catch (pingError) {
      console.error("Error al hacer ping a Cloudinary:", pingError);
      return NextResponse.json({
        status: "Error de conexión",
        cloudName,
        error: "No se pudo conectar con Cloudinary",
        instructions:
          "Verifica tu conexión a internet y que el cloud name sea correcto",
      });
    }
  } catch (error) {
    console.error("Error al verificar Cloudinary:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
