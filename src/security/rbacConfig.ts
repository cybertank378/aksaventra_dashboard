import type { UserRole } from "@/libs/enums";
import type { Permission } from "./Permissions";

export interface RoleConfigItem {
  name: string;
  label: string;
  badgeColor?: string;
  permissions: Permission[];
}

export const roleConfig: Record<UserRole, RoleConfigItem> = {
  ADMIN: {
    name: "Administrator",
    label: "Administrator",
    badgeColor: "emerald",
    permissions: [
      "DASHBOARD_VIEW",
      "ENGINE_VALIDATE",
      "ENGINE_REGISTER",
      "ENGINE_REVOKE",
      "LOGS_VIEW",
      "USERS_MANAGE",
      "SETTINGS_MANAGE",
    ],
  },
};
