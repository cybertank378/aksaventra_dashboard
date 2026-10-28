import type { UserRole } from "@/libs/enums";
import { type Permission, Permissions } from "@/security/Permissions";
import { roleConfig } from "@/security/rbacConfig";

export interface AuthContext {
  userId: string;
  role: UserRole;
  licenseKey?: string | null;
  organization?: string | null;
  engineAccess?: boolean;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && value in roleConfig;
}

function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && value in Permissions;
}

export function canAccess(
  roleOrPermission?: UserRole | Permission,
  permissionOrRole?: Permission | UserRole,
): boolean {
  if (!roleOrPermission) {
    return false;
  }

  if (!permissionOrRole) {
    return isUserRole(roleOrPermission) || isPermission(roleOrPermission);
  }

  if (isUserRole(roleOrPermission) && isPermission(permissionOrRole)) {
    return roleConfig[roleOrPermission].permissions.includes(permissionOrRole);
  }

  if (isPermission(roleOrPermission) && isUserRole(permissionOrRole)) {
    return roleConfig[permissionOrRole].permissions.includes(roleOrPermission);
  }

  return false;
}

export function canAccessRoute(auth: AuthContext, _pathname: string): boolean {
  if (!auth || !auth.userId) {
    return false;
  }

  return isUserRole(auth.role);
}

export function canAccessApi(auth: AuthContext, _pathname: string, _method?: string): boolean {
  if (!auth || !auth.userId) {
    return false;
  }

  return isUserRole(auth.role);
}
