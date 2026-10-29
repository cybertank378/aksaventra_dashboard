import type { ChartGranularity } from "@/modules/dashboards/domain/types/ChartGranularity";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";

export interface RenewalWarningDTO {
  id: string;
  clientName: string;
  serialKeyMasked: string;
  daysRemaining: number;
  expiresAt: string;
}

export interface DashboardSummaryResponseDTO {
  kpis: {
    activeLicenses: {
      total: number;
      growthRate: number; // e.g. +8.2%
    };
    expiringLicenses: {
      total: number;
      daysThreshold: number; // 30
    };
    expiredOrRevoked: {
      total: number;
    };
    hwidUtilization: {
      rate: number; // 0 - 100
      activeWithHwid: number;
      totalActive: number;
    };
  };
  renewalWarnings: RenewalWarningDTO[];
}

export interface RecentLicenseItemDTO {
  id: string;
  clientName: string;
  serialKeyMasked: string;
  engineVersion: string;
  hwidStatus: "BOUND" | "UNBOUND";
  status: DashboardLicenseState;
  expiresAt: string | null;
  createdAt: string;
}

export interface RecentLicensesResponseDTO {
  items: RecentLicenseItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    ALL: number;
    ACTIVE: number;
    EXPIRING_SOON: number;
    EXPIRED: number;
    SUSPENDED: number;
  };
}

export interface DashboardActivityDTO {
  id: string;
  action: string;
  actorName: string;
  details: string | null;
  target: string | null;
  createdAt: string;
}

export interface TimeSeriesPointDTO {
  bucket: string;
  label: string;
  value: number;
}

export interface TimeSeriesChartSeriesDTO<TKey extends string = string> {
  key: TKey;
  label: string;
  total: number;
  points: TimeSeriesPointDTO[];
}

export interface TimeSeriesChartResponseDTO<TKey extends string = string> {
  range: ChartRange;
  granularity: ChartGranularity;
  timezone: string;
  series: TimeSeriesChartSeriesDTO<TKey>[];
}

export interface DistributionSliceDTO {
  key: DashboardLicenseState;
  label: string;
  value: number;
  percent: number;
}

export interface DistributionChartResponseDTO {
  total: number;
  slices: DistributionSliceDTO[];
}
