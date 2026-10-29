import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";

export interface RecentLicensesQueryDTO {
  status?: DashboardLicenseState | "ALL";
  page?: number;
  limit?: number;
}

export interface ChartRangeQueryDTO {
  range?: ChartRange;
}

export interface ActivitiesQueryDTO {
  limit?: number;
}
