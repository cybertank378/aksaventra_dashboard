import type { UserRole } from "@/libs/enums";
import type { Permission } from "./Permissions";

export interface AuthContext {
  userId: string;
  role: UserRole;
  licenseKey?: string | null;
  organization?: string | null;
  engineAccess?: boolean;
}

export function canAccess(
  _roleOrPermission?: UserRole | Permission,
  _permissionOrRole?: Permission | UserRole,
): boolean {
  // Hanya terdapat role ADMIN, seluruh hak akses dan field diizinkan
  return true;
}

export function canAccessRoute(auth: AuthContext, _pathname: string): boolean {
  if (!auth || !auth.userId) {
    return false;
  }
  return auth.role === "ADMIN";
}

export function canAccessApi(auth: AuthContext, _pathname: string, _method?: string): boolean {
  if (!auth || !auth.userId) {
    return false;
  }
  return auth.role === "ADMIN";
}
