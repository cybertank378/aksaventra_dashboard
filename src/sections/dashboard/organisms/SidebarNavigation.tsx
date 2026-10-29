"use client";

import type { UserRole } from "@/libs/enums";
import AppSidebar, { type SidebarUserSummary } from "@/shared-ui/layout/AppSidebar";

export interface SidebarNavigationProps {
  role?: UserRole;
  user?: SidebarUserSummary | null;
  mobileOpen: boolean;
  onClose: () => void;
}

/**
 * Organism Navigasi Sidebar Utama — Aksaventra Enterprise License Suite (Light Mode).
 * Mendukung Mode Penuh (264px) dan Mode Ringkas (80px) dengan indikator server validasi real-time.
 */
export default function SidebarNavigation({
  role = "ADMIN",
  user,
  mobileOpen,
  onClose,
}: SidebarNavigationProps) {
  return <AppSidebar role={role} user={user} mobileOpen={mobileOpen} onClose={onClose} />;
}
