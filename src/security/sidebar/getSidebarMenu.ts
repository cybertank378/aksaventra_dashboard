import { FileText, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";
import type { UserRole } from "@/libs/enums";
import type { SidebarItem } from "@/shared-ui/layout/sidebar/RecursiveSidebarItem";

export interface SidebarGroup {
  label?: string;
  items: SidebarItem[];
}

export function getSidebarMenu(_role?: UserRole): SidebarGroup[] {
  const mainGroup: SidebarGroup = {
    label: "Utama",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        permission: "DASHBOARD_VIEW",
      },
      {
        label: "Engine Validation",
        path: "/dashboard/engine",
        icon: ShieldCheck,
        permission: "ENGINE_VALIDATE",
      },
      {
        label: "Audit Logs",
        path: "/dashboard/logs",
        icon: FileText,
        permission: "LOGS_VIEW",
      },
    ],
  };

  const adminGroup: SidebarGroup = {
    label: "Administrasi",
    items: [
      {
        label: "Pengguna",
        path: "/dashboard/users",
        icon: Users,
        permission: "USERS_MANAGE",
      },
      {
        label: "Pengaturan",
        path: "/dashboard/settings",
        icon: Settings,
        permission: "SETTINGS_MANAGE",
      },
    ],
  };

  return [mainGroup, adminGroup];
}
