import { Activity, Cpu, History, KeyRound, PieChart, SlidersHorizontal, Users } from "lucide-react";
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

/**
 * Struktur Navigasi Sidebar Hybrid Aksaventra (2 Grup Ringkas):
 * 1. Menu Navigasi Utama: 5 modul operasional inti (aksi seperti "+ Buat Lisensi Baru" berada pada header/halaman).
 * 2. Sistem & Administrasi: Pengelolaan pengguna RBAC dan konfigurasi sistem.
 */
export function getSidebarMenu(role: UserRole = "ADMIN"): SidebarGroup[] {
  const rawGroups: SidebarGroup[] = [
    {
      label: "Menu Navigasi Utama",
      items: [
        {
          label: "Dasbor",
          path: "/dashboard",
          icon: PieChart,
          permission: "DASHBOARD_VIEW",
        },
        {
          label: "Manajemen Lisensi",
          path: "/dashboard/licenses",
          icon: KeyRound,
          permission: "LICENSES_VIEW",
          activeMatchPrefixes: ["/dashboard/licenses/create", "/dashboard/licenses/revocations"],
        },
        {
          label: "Perangkat Terikat",
          path: "/dashboard/licenses/devices",
          icon: Cpu,
          permission: "LICENSES_MANAGE",
        },
        {
          label: "Monitor & Validasi Engine",
          path: "/dashboard/engine/monitor",
          icon: Activity,
          permission: "ENGINE_VALIDATE",
          activeMatchPrefixes: ["/dashboard/engine"],
        },
        {
          label: "Riwayat Aktivitas",
          path: "/dashboard/logs/validations",
          icon: History,
          permission: "LOGS_VIEW",
          activeMatchPrefixes: ["/dashboard/logs"],
        },
      ],
    },
    {
      label: "Sistem & Administrasi",
      items: [
        {
          label: "Pengguna & Role",
          path: "/dashboard/users",
          icon: Users,
          permission: "USERS_MANAGE",
        },
        {
          label: "Pengaturan Sistem",
          path: "/dashboard/settings",
          icon: SlidersHorizontal,
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
