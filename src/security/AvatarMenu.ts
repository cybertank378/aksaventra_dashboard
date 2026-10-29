import type { LucideIcon } from "lucide-react";
import { Settings, ShieldAlert, User } from "lucide-react";
import type { UserRole } from "@/libs/enums";

export interface AvatarMenuItem {
  label: string;
  icon?: LucideIcon;
  path: string;
  action?: string;
}

export function getAvatarMenuByRole(_role?: UserRole): AvatarMenuItem[] {
  return [
    { label: "Profile", icon: User, path: "/profile" },
    { label: "Settings", icon: Settings, path: "/settings" },
    { label: "Security Audit", icon: ShieldAlert, path: "/admin/security" },
  ];
}
