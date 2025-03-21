import { currentUser } from "@clerk/nextjs";

/**
 * Función de utilidad para verificar si el usuario actual tiene rol de administrador
 * @returns {Promise<boolean>} - Verdadero si el usuario es administrador, falso en caso contrario
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    // Obtener el usuario actual
    const user = await currentUser();

    // Si no hay usuario, definitivamente no es admin
    if (!user) {
      return false;
    }

    // Intentar obtener el rol desde los metadatos públicos
    let userRole: string | undefined;

    // 1. Verificar en publicMetadata
    if (user.publicMetadata && typeof user.publicMetadata === "object") {
      const metadata = user.publicMetadata as Record<string, unknown>;
      if (typeof metadata.role === "string") {
        userRole = metadata.role;
      }
    }

    // 2. Si no hay rol en public, verificar en privateMetadata
    if (
      !userRole &&
      user.privateMetadata &&
      typeof user.privateMetadata === "object"
    ) {
      const metadata = user.privateMetadata as Record<string, unknown>;
      if (typeof metadata.role === "string") {
        userRole = metadata.role;
      }
    }

    // Determinar si el usuario es admin
    return userRole === "admin";
  } catch (error) {
    console.error(
      "[AUTH_UTILS] Error verificando rol de administrador:",
      error
    );
    return false;
  }
}

/**
 * Función de utilidad para obtener el rol del usuario actual
 * @returns {Promise<string|null>} - El rol del usuario o null si no tiene rol
 */
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    // Obtener el usuario actual
    const user = await currentUser();

    // Si no hay usuario, no hay rol
    if (!user) {
      return null;
    }

    // Intentar obtener el rol desde los metadatos públicos
    // 1. Verificar en publicMetadata
    if (user.publicMetadata && typeof user.publicMetadata === "object") {
      const metadata = user.publicMetadata as Record<string, unknown>;
      if (typeof metadata.role === "string") {
        return metadata.role;
      }
    }

    // 2. Verificar en privateMetadata
    if (user.privateMetadata && typeof user.privateMetadata === "object") {
      const metadata = user.privateMetadata as Record<string, unknown>;
      if (typeof metadata.role === "string") {
        return metadata.role;
      }
    }

    // No se encontró rol
    return null;
  } catch (error) {
    console.error("[AUTH_UTILS] Error obteniendo rol de usuario:", error);
    return null;
  }
}
