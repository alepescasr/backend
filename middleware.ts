import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { allowedOrigins } from "./lib/cors-utils";

// Middleware para configurar CORS en todas las solicitudes
function corsMiddleware(request: Request) {
  // Obtener información de la solicitud
  const origin = request.headers.get("origin");
  const isPreflight = request.method === "OPTIONS";

  // URL actual
  const url = new URL(request.url);
  const isApiRoute = url.pathname.startsWith("/api");

  // Verificar si es una ruta de API y si el origen está permitido
  if (isApiRoute) {
    // Para solicitudes de pre-vuelo (OPTIONS), responder directamente
    if (isPreflight) {
      const response = new NextResponse(null, { status: 204 }); // No Content

      // Configurar cabeceras CORS
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-clerk-auth"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Max-Age", "86400"); // 24 horas

      // Permitir origen específico o usar comodín
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      } else {
        response.headers.set("Access-Control-Allow-Origin", "*");
      }

      return response;
    }

    // Para otras solicitudes, continuar pero devolver una función que modificará la respuesta
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Para rutas que no son de API, continuar sin modificar
  return NextResponse.next();
}

// Configuración de Clerk Auth Middleware
export default authMiddleware({
  publicRoutes: ["/api/:path*"],
  beforeAuth: (req) => {
    // Aplicar CORS antes de la autenticación
    return corsMiddleware(req);
  },
  afterAuth: (auth, req) => {
    // Resto de la lógica después de la autenticación
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
