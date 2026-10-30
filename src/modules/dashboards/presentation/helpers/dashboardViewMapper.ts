import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";

export const VALIDATION_SERIES_COLORS: Record<ValidationTrendSeriesKey, string> = {
  verified: "#2563EB", // blue-600
  activated: "#10B981", // emerald-500
  mismatch: "#F43F5E", // rose-500
  rejected: "#F59E0B", // amber-500
};

export const LICENSE_STATUS_CONFIG: Record<
  DashboardLicenseState,
  { label: string; bgClass: string; textClass: string; borderClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: "Aktif",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  EXPIRING_SOON: {
    label: "Segera Habis",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200",
    dotClass: "bg-amber-500",
  },
  EXPIRED: {
    label: "Kedaluwarsa",
    bgClass: "bg-slate-100",
    textClass: "text-slate-600",
    borderClass: "border-slate-200",
    dotClass: "bg-slate-400",
  },
  SUSPENDED: {
    label: "Dicabut",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700",
    borderClass: "border-rose-200",
    dotClass: "bg-rose-500",
  },
};
