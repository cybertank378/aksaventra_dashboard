import type { LucideIcon } from "lucide-react";
import { Settings, ShieldAlert, User } from "lucide-react";
import type { UserRole } from "@/libs/enums";
import { canAccess } from "@/security/fieldGuard";

export interface AvatarMenuItem {
  label: string;
  icon?: LucideIcon;
  path: string;
  action?: string;
}

/**
 * Returns role-aware avatar dropdown menu items.
 * Aligned with protected dashboard routing:
 * - Profile: /dashboard/profile (All authenticated roles)
 * - Settings: /dashboard/settings (Only roles with SETTINGS_MANAGE)
 * - Security Audit: /dashboard/security (Only roles with LOGS_VIEW)
 */
export function getAvatarMenuByRole(role?: UserRole): AvatarMenuItem[] {
  const items: AvatarMenuItem[] = [{ label: "Profile", icon: User, path: "/dashboard/profile" }];

  if (role && canAccess(role, "SETTINGS_MANAGE")) {
    items.push({
      label: "Settings",
      icon: Settings,
      path: "/dashboard/settings",
    });
  }

  if (role && canAccess(role, "LOGS_VIEW")) {
    items.push({
      label: "Security Audit",
      icon: ShieldAlert,
      path: "/dashboard/security",
    });
  }

  return items;
}
