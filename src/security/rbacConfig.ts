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
      "LICENSES_VIEW",
      "LICENSES_CREATE",
      "LICENSES_MANAGE",
      "LICENSES_REVOKE",
      "ENGINE_VALIDATE",
      "ENGINE_REGISTER",
      "ENGINE_REVOKE",
      "LOGS_VIEW",
      "USERS_MANAGE",
      "SETTINGS_MANAGE",
    ],
  },
  OPERATOR: {
    name: "Operator",
    label: "License Operator",
    badgeColor: "cyan",
    permissions: [
      "DASHBOARD_VIEW",
      "LICENSES_VIEW",
      "LICENSES_CREATE",
      "LICENSES_MANAGE",
      "ENGINE_VALIDATE",
      "LOGS_VIEW",
    ],
  },
  AUDITOR: {
    name: "Auditor",
    label: "Security Auditor",
    badgeColor: "orange",
    permissions: ["DASHBOARD_VIEW", "LICENSES_VIEW", "ENGINE_VALIDATE", "LOGS_VIEW"],
  },
  CLIENT: {
    name: "Client",
    label: "Client / Customer",
    badgeColor: "purple",
    permissions: ["DASHBOARD_VIEW", "LICENSES_VIEW"],
  },
};
