// Files: src/shared-ui/layout/sidebar/RecursiveSidebarItem.tsx

"use client";

import clsx from "clsx";

import { AnimatePresence, motion } from "framer-motion";

import { ChevronDown } from "lucide-react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import type React from "react";
import { useMemo } from "react";

import type { UserRole } from "@/libs/enums";

import { canAccess } from "@/security/fieldGuard";

import type { Permission } from "@/security/Permissions";

/* ============================================================
 * SIDEBAR ITEM
 * ============================================================
 */

export type SidebarItem = {
  label: string;

  path?: string;

  icon?: React.ElementType;

  permission?: Permission;

  children?: SidebarItem[];
};

/* ============================================================
 * PROPS
 * ============================================================
 */

interface Props {
  item: SidebarItem;

  role?: UserRole;

  depth?: number;

  onNavigate?: () => void;

  openKey: string | null;

  setOpenKey: React.Dispatch<React.SetStateAction<string | null>>;
}

/* ============================================================
 * COMPONENT
 * ============================================================
 */

export function RecursiveSidebarItem({
  item,
  role = "ADMIN",
  depth = 0,
  onNavigate,
  openKey,
  setOpenKey,
}: Props) {
  ////////////////////////////////////////////////////////////
  // PATHNAME
  ////////////////////////////////////////////////////////////

  const pathname = usePathname();

  ////////////////////////////////////////////////////////////
  // PERMISSION
  ////////////////////////////////////////////////////////////

  const allowed = useMemo(() => {
    if (!item.permission) {
      return true;
    }

    return canAccess(role, item.permission);
  }, [item.permission, role]);

  ////////////////////////////////////////////////////////////
  // CHILDREN
  ////////////////////////////////////////////////////////////

  const hasChildren = Boolean(item.children?.length);

  ////////////////////////////////////////////////////////////
  // ACTIVE
  ////////////////////////////////////////////////////////////

  const isActive = useMemo(() => {
    //////////////////////////////////////////////////////////
    // EXACT MATCH
    //////////////////////////////////////////////////////////

    if (item.path && pathname === item.path) {
      return true;
    }

    //////////////////////////////////////////////////////////
    // CHILD MATCH
    //////////////////////////////////////////////////////////

    return (
      item.children?.some((child) => (child.path ? pathname.startsWith(child.path) : false)) ??
      false
    );
  }, [item.children, item.path, pathname]);

  ////////////////////////////////////////////////////////////
  // ITEM KEY
  ////////////////////////////////////////////////////////////

  const itemKey = item.path ?? item.label;

  ////////////////////////////////////////////////////////////
  // OPEN STATE
  ////////////////////////////////////////////////////////////

  const open = openKey === itemKey;

  ////////////////////////////////////////////////////////////
  // HIDE IF NO ACCESS
  ////////////////////////////////////////////////////////////

  if (!allowed) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // ICON
  ////////////////////////////////////////////////////////////

  const Icon = item.icon;

  ////////////////////////////////////////////////////////////
  // STYLE
  ////////////////////////////////////////////////////////////

  const paddingLeft = 14 + depth * 18;

  ////////////////////////////////////////////////////////////
  // CLASSNAME
  ////////////////////////////////////////////////////////////

  const itemClass = clsx(
    "group flex h-11 w-full items-center justify-between rounded-2xl pr-3 transition-all duration-200",
    isActive
      ? "bg-indigo-600 text-white shadow-sm"
      : "text-slate-300 hover:bg-sky-900 hover:text-white",
  );

  ////////////////////////////////////////////////////////////
  // TOGGLE OPEN
  ////////////////////////////////////////////////////////////

  const handleToggle = () => {
    setOpenKey((prev) => (prev === itemKey ? null : itemKey));
  };

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div className="space-y-1">
      {/* ================================================== */}
      {/* PARENT */}
      {/* ================================================== */}

      {hasChildren ? (
        <button
          type="button"
          onClick={handleToggle}
          style={{
            paddingLeft,
          }}
          className={itemClass}
        >
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <Icon
                size={18}
                className={clsx("shrink-0", isActive ? "text-white" : "text-slate-400")}
              />
            )}

            <span className="truncate text-sm font-medium">{item.label}</span>
          </div>

          {/* RIGHT */}

          <motion.div
            animate={{
              rotate: open ? 180 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <ChevronDown size={15} />
          </motion.div>
        </button>
      ) : (
        /* ================================================ */
        /* LINK */
        /* ================================================ */

        <Link
          href={item.path ?? "#"}
          onClick={onNavigate}
          style={{
            paddingLeft,
          }}
          className={itemClass}
        >
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <Icon
                size={18}
                className={clsx("shrink-0", isActive ? "text-white" : "text-slate-400")}
              />
            )}

            <span className="truncate text-sm font-medium">{item.label}</span>
          </div>
        </Link>
      )}

      {/* ================================================== */}
      {/* CHILDREN */}
      {/* ================================================== */}

      <AnimatePresence initial={false}>
        {hasChildren && open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pt-1">
              {item.children?.map((child) => (
                <RecursiveSidebarItem
                  key={child.path ?? child.label}
                  item={child}
                  role={role}
                  depth={depth + 1}
                  onNavigate={onNavigate}
                  openKey={openKey}
                  setOpenKey={setOpenKey}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
