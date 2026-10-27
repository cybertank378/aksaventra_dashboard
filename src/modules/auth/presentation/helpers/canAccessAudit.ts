import type { UserRole } from "@/libs/enums";
import { canAccess } from "@/security/fieldGuard";

export function canAccessAudit(role?: UserRole): boolean {
  return canAccess(role, "LOGS_VIEW");
}
