/**
 * Utilidades para manejar CORS en las respuestas de la API
 */

/**
 * Lista de dominios permitidos para hacer peticiones a la API
 * Añade aquí los dominios de tu tienda o cualquier otro frontend que necesite acceder a la API
 */
export const allowedOrigins = [
  "https://alepesca.com",
  "https://www.alepesca.com",
  "http://localhost:3000",
  "http://localhost:3001",
  // Añade aquí otros dominios que necesites
];

/**
 * Verifica si un origen está permitido para CORS
 * @param origin Origen de la petición (ej: https://example.com)
 * @returns Verdadero si el origen está permitido, falso en caso contrario
 */
export function isOriginAllowed(origin: string | null): boolean {
  // Si no hay origen, denegar por defecto
  if (!origin) return false;

  // Verificar si el origen está en la lista de permitidos
  return allowedOrigins.some(
    (allowedOrigin) =>
      origin === allowedOrigin ||
      origin.endsWith(`.${allowedOrigin.replace(/^https?:\/\//, "")}`)
  );
}

/**
 * Aplica las cabeceras CORS a una respuesta
 * @param headers Objeto Headers al que añadir las cabeceras CORS
 * @param origin Origen de la petición
 * @returns El mismo objeto Headers con las cabeceras CORS añadidas
 */
export function applyCorsHeaders(
  headers: Headers,
  origin: string | null
): Headers {
  // Si el origen está permitido, configurar CORS para ese origen específico
  if (origin && isOriginAllowed(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    // Si no hay origen o no está permitido, usar comodín (menos seguro, solo para desarrollo)
    headers.set("Access-Control-Allow-Origin", "*");
  }

  // Configurar otras cabeceras CORS necesarias
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Max-Age", "86400"); // 24 horas en segundos

  return headers;
}

/**
 * Crea un objeto Headers con las cabeceras CORS y otras cabeceras comunes ya configuradas
 * @param origin Origen de la petición
 * @param cacheControl Valor para la cabecera Cache-Control (por defecto: 'no-store')
 * @returns Objeto Headers configurado
 */
export function createCorsHeaders(
  origin: string | null = null,
  cacheControl: string = "no-store"
): Headers {
  const headers = new Headers();

  // Aplicar cabeceras CORS
  applyCorsHeaders(headers, origin);

  // Aplicar otras cabeceras comunes
  headers.set("Cache-Control", cacheControl);
  headers.set("Content-Type", "application/json");

  return headers;
}
