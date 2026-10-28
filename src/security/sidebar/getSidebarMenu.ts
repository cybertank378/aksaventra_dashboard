import {
  Activity,
  Cpu,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { UserRole } from "@/libs/enums";
import { canAccess } from "@/security/fieldGuard";
import { evaluatePolicy } from "@/security/policyEngine";
import type { SidebarItem } from "@/shared-ui/layout/sidebar/RecursiveSidebarItem";

export interface SidebarGroup {
  label?: string;
  items: SidebarItem[];
}

function filterSidebarItems(items: SidebarItem[], role: UserRole): SidebarItem[] {
  const result: SidebarItem[] = [];

  for (const item of items) {
    if (item.permission && !canAccess(role, item.permission)) {
      continue;
    }

    if (
      item.path &&
      !evaluatePolicy({
        path: item.path,
        method: "GET",
        auth: {
          userId: "sidebar-menu-check",
          role,
          engineAccess: true,
        },
      })
    ) {
      continue;
    }

    if (item.children && item.children.length > 0) {
      const filteredChildren = filterSidebarItems(item.children, role);
      if (filteredChildren.length === 0 && !item.path) {
        continue;
      }
      result.push({
        ...item,
        children: filteredChildren,
      });
      continue;
    }

    result.push(item);
  }

  return result;
}

export function getSidebarMenu(role: UserRole = "ADMIN"): SidebarGroup[] {
  const rawGroups: SidebarGroup[] = [
    {
      label: "Ikhtisar",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          permission: "DASHBOARD_VIEW",
        },
      ],
    },
    {
      label: "Manajemen Lisensi",
      items: [
        {
          label: "Semua Lisensi",
          path: "/dashboard/licenses",
          icon: KeyRound,
          permission: "LICENSES_VIEW",
        },
        {
          label: "Terbitkan Lisensi",
          path: "/dashboard/licenses/create",
          icon: PlusCircle,
          permission: "LICENSES_CREATE",
        },
        {
          label: "Perangkat Terikat (HWID)",
          path: "/dashboard/licenses/devices",
          icon: Cpu,
          permission: "LICENSES_MANAGE",
        },
        {
          label: "Blacklist & Revokasi",
          path: "/dashboard/licenses/revocations",
          icon: ShieldAlert,
          permission: "LICENSES_REVOKE",
        },
      ],
    },
    {
      label: "Engine & Validasi",
      items: [
        {
          label: "Live Validation Monitor",
          path: "/dashboard/engine/monitor",
          icon: Activity,
          permission: "ENGINE_VALIDATE",
        },
        {
          label: "Integritas Binary (SHA-256)",
          path: "/dashboard/engine/integrity",
          icon: ShieldCheck,
          permission: "ENGINE_VALIDATE",
        },
      ],
    },
    {
      label: "Audit & Logs",
      items: [
        {
          label: "Log Validasi Mesin",
          path: "/dashboard/logs/validations",
          icon: FileText,
          permission: "LOGS_VIEW",
        },
        {
          label: "Log Aktivitas Admin",
          path: "/dashboard/logs/audit",
          icon: History,
          permission: "LOGS_VIEW",
        },
      ],
    },
    {
      label: "Administrasi",
      items: [
        {
          label: "Pengguna & Role",
          path: "/dashboard/users",
          icon: Users,
          permission: "USERS_MANAGE",
        },
        {
          label: "Pengaturan & Kebijakan",
          path: "/dashboard/settings",
          icon: Settings,
          permission: "SETTINGS_MANAGE",
        },
      ],
    },
  ];

  return rawGroups
    .map((group) => ({
      ...group,
      items: filterSidebarItems(group.items, role),
    }))
    .filter((group) => group.items.length > 0);
}
