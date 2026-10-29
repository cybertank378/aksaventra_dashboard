import type {
  ActivitiesQueryDTO,
  ChartRangeQueryDTO,
  RecentLicensesQueryDTO,
} from "@/modules/dashboards/domain/dto/DashboardRequestDTO";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";
import {
  DEFAULT_CHART_RANGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "@/modules/dashboards/shared/constants/dashboardConstants";

export interface ValidationOutput<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

const VALID_RANGES: readonly ChartRange[] = ["7d", "30d", "90d"];
const VALID_STATUSES: readonly (DashboardLicenseState | "ALL")[] = [
  "ALL",
  "ACTIVE",
  "EXPIRING_SOON",
  "EXPIRED",
  "SUSPENDED",
];

export class DashboardValidator {
  public static validateChartRange(input: unknown): ValidationOutput<ChartRangeQueryDTO> {
    const errors: Record<string, string> = {};
    if (!input || typeof input !== "object") {
      return { isValid: true, errors, data: { range: DEFAULT_CHART_RANGE } };
    }

    const obj = input as Record<string, unknown>;
    const rawRange = obj.range;

    if (rawRange === undefined || rawRange === null || rawRange === "") {
      return { isValid: true, errors, data: { range: DEFAULT_CHART_RANGE } };
    }

    if (typeof rawRange !== "string" || !VALID_RANGES.includes(rawRange as ChartRange)) {
      errors.range = "Parameter range harus salah satu dari: 7d, 30d, 90d";
      return { isValid: false, errors };
    }

    return { isValid: true, errors, data: { range: rawRange as ChartRange } };
  }

  public static validateRecentLicenses(input: unknown): ValidationOutput<RecentLicensesQueryDTO> {
    const errors: Record<string, string> = {};
    if (!input || typeof input !== "object") {
      return {
        isValid: true,
        errors,
        data: { status: "ALL", page: 1, limit: DEFAULT_PAGE_LIMIT },
      };
    }

    const obj = input as Record<string, unknown>;
    let status: DashboardLicenseState | "ALL" = "ALL";
    let page = 1;
    let limit = DEFAULT_PAGE_LIMIT;

    if (obj.status !== undefined && obj.status !== null && obj.status !== "") {
      if (
        typeof obj.status !== "string" ||
        !VALID_STATUSES.includes(obj.status as DashboardLicenseState | "ALL")
      ) {
        errors.status = "Parameter status tidak valid";
      } else {
        status = obj.status as DashboardLicenseState | "ALL";
      }
    }

    if (obj.page !== undefined && obj.page !== null && obj.page !== "") {
      const parsedPage = Number(obj.page);
      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        errors.page = "Parameter page harus berupa bilangan bulat positif";
      } else {
        page = parsedPage;
      }
    }

    if (obj.limit !== undefined && obj.limit !== null && obj.limit !== "") {
      const parsedLimit = Number(obj.limit);
      if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
        errors.limit = "Parameter limit harus berupa bilangan bulat positif";
      } else if (parsedLimit > MAX_PAGE_LIMIT) {
        errors.limit = `Parameter limit tidak boleh melebihi ${MAX_PAGE_LIMIT}`;
      } else {
        limit = parsedLimit;
      }
    }

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      errors,
      data: { status, page, limit },
    };
  }

  public static validateActivities(input: unknown): ValidationOutput<ActivitiesQueryDTO> {
    const errors: Record<string, string> = {};
    if (!input || typeof input !== "object") {
      return { isValid: true, errors, data: { limit: 6 } };
    }

    const obj = input as Record<string, unknown>;
    let limit = 6;

    if (obj.limit !== undefined && obj.limit !== null && obj.limit !== "") {
      const parsedLimit = Number(obj.limit);
      if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
        errors.limit = "Parameter limit harus berupa bilangan bulat positif";
      } else if (parsedLimit > 20) {
        errors.limit = "Parameter limit tidak boleh melebihi 20";
      } else {
        limit = parsedLimit;
      }
    }

    if (Object.keys(errors).length > 0) {
      return { isValid: false, errors };
    }

    return { isValid: true, errors, data: { limit } };
  }
}
