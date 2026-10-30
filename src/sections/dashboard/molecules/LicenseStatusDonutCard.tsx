"use client";

import type React from "react";
import type { DistributionChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import Card from "@/shared-ui/component/Card";
import { DonutChart, type DonutSlice } from "@/shared-ui/component/Chart/DonutChart";
import Skeleton from "@/shared-ui/component/Skeleton";

export interface LicenseStatusDonutCardProps {
  distribution?: DistributionChartResponseDTO;
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10B981", // emerald-500
  EXPIRING_SOON: "#F59E0B", // amber-500
  EXPIRED: "#94A3B8", // slate-400
  SUSPENDED: "#F43F5E", // rose-500
};

export function LicenseStatusDonutCard({
  distribution,
  loading = false,
}: LicenseStatusDonutCardProps): React.JSX.Element {
  if (loading) {
    return (
      <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs">
        <Skeleton className="w-1/2 h-5 mb-4" />
        <Skeleton className="w-48 h-48 mx-auto my-4 rounded-full" />
      </Card>
    );
  }

  const slices: DonutSlice[] = (distribution?.slices ?? []).map((s) => ({
    key: s.key,
    label: s.label,
    value: s.value,
    color: STATUS_COLORS[s.key] ?? "#94A3B8",
  }));

  return (
    <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Distribusi Status Lisensi</h3>
        <p className="mt-0.5 text-xs text-slate-500">Komposisi seluruh lisensi dalam sistem</p>
      </div>

      <div className="my-auto py-2">
        <DonutChart slices={slices} height={200} />
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
        {(distribution?.slices ?? []).map((s) => (
          <div key={s.key} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s.key] ?? "#94A3B8" }}
              />
              <span className="text-slate-600 font-medium">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tabular-nums text-slate-900">
                {s.value.toLocaleString("id-ID")}
              </span>
              <span className="text-slate-400 font-normal">({s.percent.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default LicenseStatusDonutCard;
