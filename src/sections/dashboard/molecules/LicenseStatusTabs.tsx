"use client";

import type React from "react";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";

export type StatusTabKey = DashboardLicenseState | "ALL";

export interface LicenseStatusTabsProps {
  currentTab: StatusTabKey;
  counts?: Record<StatusTabKey, number>;
  onTabChange: (tab: StatusTabKey) => void;
}

const TABS: Array<{ key: StatusTabKey; label: string }> = [
  { key: "ALL", label: "Semua" },
  { key: "ACTIVE", label: "Aktif" },
  { key: "EXPIRING_SOON", label: "Segera Habis" },
  { key: "EXPIRED", label: "Kedaluwarsa" },
  { key: "SUSPENDED", label: "Dicabut" },
];

export function LicenseStatusTabs({
  currentTab,
  counts,
  onTabChange,
}: LicenseStatusTabsProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/90 pb-3">
      {TABS.map((tab) => {
        const isSelected = currentTab === tab.key;
        const count = counts ? (counts[tab.key] ?? 0) : undefined;

        const handleTabClick = () => {
          onTabChange(tab.key);
        };

        return (
          <button
            key={tab.key}
            type="button"
            onClick={handleTabClick}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? "bg-blue-600 text-white shadow-xs shadow-blue-500/20"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            {count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums ${
                  isSelected ? "bg-white/20 text-white" : "bg-white text-slate-700 shadow-2xs"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default LicenseStatusTabs;
