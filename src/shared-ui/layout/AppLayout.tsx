// Files: src/shared-ui/layout/AppLayout.tsx

"use client";

import { type ReactNode, useState } from "react";

import type { UserRole } from "@/libs/enums";

import AppSidebar from "@/shared-ui/layout/AppSidebar";
import AppTopbar from "@/shared-ui/layout/AppTopbar";

interface Props {
  children: ReactNode;

  role?: UserRole;
}

export default function AppLayout({ children, role = "ADMIN" }: Props) {
  //////////////////////////////////////////////////////////////
  // MOBILE SIDEBAR
  //////////////////////////////////////////////////////////////

  const [mobileOpen, setMobileOpen] = useState(false);

  //////////////////////////////////////////////////////////////
  // RENDER
  //////////////////////////////////////////////////////////////

  return (
    <div className="flex h-screen overflow-hidden bg-surface-subtle">
      {/* SIDEBAR */}

      <AppSidebar role={role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* RIGHT LAYOUT */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* TOPBAR */}

        <AppTopbar role={role} onMenuClick={() => setMobileOpen(true)} />

        {/* SCROLLABLE CONTENT */}

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="min-h-full px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
