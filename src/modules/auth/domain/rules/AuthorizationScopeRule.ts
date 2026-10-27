import type { UserRole } from "@/libs/enums";
import { canAccess } from "@/security/fieldGuard";
import type { Permission } from "@/security/Permissions";

export class AuthorizationScopeRule {
  public static canAccess(role: UserRole, permission: Permission): boolean {
    return canAccess(role, permission);
  }
}
