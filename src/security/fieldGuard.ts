import type { UserRole } from "@/libs/enums";
import type { Permission } from "./Permissions";

export function canAccess(
  _roleOrPermission?: UserRole | Permission,
  _permissionOrRole?: Permission | UserRole,
): boolean {
  // Hanya terdapat role ADMIN, seluruh hak akses dan field diizinkan
  return true;
}
