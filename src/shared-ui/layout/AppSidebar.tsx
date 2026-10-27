"use client";

import { AnimatePresence, motion } from "framer-motion";

import { LayoutDashboard } from "lucide-react";

import { useState } from "react";

import type { UserRole } from "@/libs/enums";

import { getSidebarMenu, type SidebarGroup } from "@/security/sidebar/getSidebarMenu";
import { YayasanLogo } from "@/shared-ui/component/Icons";
import {
  RecursiveSidebarItem,
  type SidebarItem,
} from "@/shared-ui/layout/sidebar/RecursiveSidebarItem";

interface Props {
  role?: UserRole;

  mobileOpen: boolean;

  onClose: () => void;
}

export default function AppSidebar({ role = "ADMIN", mobileOpen, onClose }: Props) {
  ////////////////////////////////////////////////////////////
  // SIDEBAR GROUPS
  ////////////////////////////////////////////////////////////

  const groups = getSidebarMenu(role);

  ////////////////////////////////////////////////////////////
  // OPEN KEY
  ////////////////////////////////////////////////////////////

  const [openKey, setOpenKey] = useState<string | null>(null);

  ////////////////////////////////////////////////////////////
  // SIDEBAR CONTENT
  const SidebarContent = (
    <div className="flex h-screen w-72 flex-col bg-sky-950">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="border-b border-slate-700 px-5 py-5">
        {/* LOGO + TITLE */}

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-sm">
            <YayasanLogo size={42} className="drop-shadow-xl" />
          </div>

          <div>
            <h1 className="text-sm font-bold text-white">Monitoring Pengawasan</h1>

            <p className="mt-1 text-xs text-slate-400">Satdik Hang Tuah</p>
          </div>
        </div>

        {/* ACTIVE ROLE */}

        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-indigo-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <LayoutDashboard size={18} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Role Aktif
            </p>

            <p className="text-sm font-semibold text-slate-800">{role.replaceAll("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* NAVIGATION */}
      {/* ================================================= */}

      <nav className="flex-1 overflow-y-auto bg-sky-950 px-3 py-5">
        <div className="space-y-7">
          {groups.map((group: SidebarGroup, index: number) => (
            <div key={`group-${group.label ?? index}`}>
              {/* GROUP LABEL */}

              {group.label && (
                <div className="mb-3 px-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {group.label}
                  </p>
                </div>
              )}

              {/* MENU */}

              <div className="space-y-1">
                {group.items.map((item: SidebarItem, itemIndex: number) => (
                  <RecursiveSidebarItem
                    key={item.path ?? `${group.label ?? "group"}-${item.label}-${itemIndex}`}
                    item={item}
                    role={role}
                    onNavigate={onClose}
                    openKey={openKey}
                    setOpenKey={setOpenKey}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <div className="border-t border-slate-700 bg-sky-950 px-5 py-4">
        <div className="rounded-2xl px-4 py-3">
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} Yayasan Hang Tuah
          </p>
        </div>
      </div>
    </div>
  );

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <>
      {/* ================================================= */}
      {/* DESKTOP */}
      {/* ================================================= */}

      <aside className="hidden md:flex">{SidebarContent}</aside>

      {/* ================================================= */}
      {/* MOBILE */}
      {/* ================================================= */}

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* OVERLAY */}

            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* SIDEBAR */}

            <motion.aside
              className="fixed left-0 top-0 z-50 md:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
              }}
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
