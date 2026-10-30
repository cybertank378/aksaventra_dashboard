import { AlertTriangle, Cpu, Key, ShieldAlert } from "lucide-react";
import type React from "react";
import type { DashboardSummaryResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { DashboardKpiCard } from "@/sections/dashboard/atomic/DashboardKpiCard";
import { KpiTrendIndicator } from "@/sections/dashboard/atomic/KpiTrendIndicator";
import Skeleton from "@/shared-ui/component/Skeleton";

export interface DashboardKpiGridProps {
  summary?: DashboardSummaryResponseDTO;
  loading?: boolean;
}

export function DashboardKpiGrid({
  summary,
  loading = false,
}: DashboardKpiGridProps): React.JSX.Element {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={`kpi-skel-${i}`} className="rounded-2xl border border-slate-100 bg-white p-5">
            <Skeleton className="w-1/2 h-4 mb-3" />
            <Skeleton className="w-1/3 h-8 mb-4" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        ))}
      </div>
    );
  }

  const { kpis } = summary;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Lisensi Aktif */}
      <DashboardKpiCard
        title="Lisensi Aktif"
        value={kpis.activeLicenses.total.toLocaleString("id-ID")}
        icon={<Key className="h-5 w-5" />}
        iconBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
        trend={<KpiTrendIndicator growthRate={kpis.activeLicenses.growthRate} />}
      />

      {/* 2. Segera Habis */}
      <DashboardKpiCard
        title="Segera Habis"
        value={kpis.expiringLicenses.total.toLocaleString("id-ID")}
        icon={<AlertTriangle className="h-5 w-5" />}
        iconBgClass="bg-amber-50"
        iconColorClass="text-amber-600"
        subtext={`≤ ${kpis.expiringLicenses.daysThreshold} hari ke depan`}
      />

      {/* 3. Kedaluwarsa / Dicabut */}
      <DashboardKpiCard
        title="Kedaluwarsa / Dicabut"
        value={kpis.expiredOrRevoked.total.toLocaleString("id-ID")}
        icon={<ShieldAlert className="h-5 w-5" />}
        iconBgClass="bg-rose-50"
        iconColorClass="text-rose-600"
        subtext="Perlu pembaruan atau dicabut"
      />

      {/* 4. Utilisasi HWID */}
      <DashboardKpiCard
        title="Utilisasi HWID"
        value={`${kpis.hwidUtilization.rate.toFixed(1)}%`}
        icon={<Cpu className="h-5 w-5" />}
        iconBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
        progressBarPercent={kpis.hwidUtilization.rate}
        progressBarColorClass="bg-emerald-500"
        subtext={`${kpis.hwidUtilization.activeWithHwid} dari ${kpis.hwidUtilization.totalActive} aktif`}
      />
    </div>
  );
}

export default DashboardKpiGrid;
