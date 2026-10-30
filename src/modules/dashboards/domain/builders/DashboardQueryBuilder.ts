import type { ChartGranularity } from "@/modules/dashboards/domain/types/ChartGranularity";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";
import { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";
import {
  DASHBOARD_TIMEZONE,
  DEFAULT_CHART_RANGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "@/modules/dashboards/shared/constants/dashboardConstants";

export interface BuiltDashboardQuery {
  range: ChartRange;
  granularity: ChartGranularity;
  timezone: string;
  status: DashboardLicenseState | "ALL";
  page: number;
  limit: number;
  offset: number;
}

export class DashboardQueryBuilder {
  private _range: ChartRange = DEFAULT_CHART_RANGE;
  private _granularity?: ChartGranularity;
  private _timezone: string = DASHBOARD_TIMEZONE;
  private _status: DashboardLicenseState | "ALL" = "ALL";
  private _page = 1;
  private _limit = DEFAULT_PAGE_LIMIT;

  public static create(): DashboardQueryBuilder {
    return new DashboardQueryBuilder();
  }

  public withRange(range?: ChartRange): this {
    if (range) {
      this._range = range;
    }
    return this;
  }

  public withGranularity(granularity?: ChartGranularity): this {
    if (granularity) {
      this._granularity = granularity;
    }
    return this;
  }

  public withTimezone(timezone?: string): this {
    if (timezone && timezone.trim().length > 0) {
      this._timezone = timezone.trim();
    }
    return this;
  }

  public withStatus(status?: DashboardLicenseState | "ALL"): this {
    if (status) {
      this._status = status;
    }
    return this;
  }

  public withPagination(page?: number, limit?: number): this {
    if (page !== undefined && Number.isInteger(page) && page > 0) {
      this._page = page;
    }
    if (limit !== undefined && Number.isInteger(limit) && limit > 0) {
      this._limit = Math.min(limit, MAX_PAGE_LIMIT);
    }
    return this;
  }

  public getEffectiveGranularity(): ChartGranularity {
    if (this._granularity) {
      return this._granularity;
    }
    return this._range === "90d" ? "week" : "day";
  }

  public buildDateRange(now: Date = new Date()): DateRange {
    return DateRange.fromChartRange(this._range, now);
  }

  public build(): BuiltDashboardQuery {
    const granularity = this.getEffectiveGranularity();
    const offset = (this._page - 1) * this._limit;

    return {
      range: this._range,
      granularity,
      timezone: this._timezone,
      status: this._status,
      page: this._page,
      limit: this._limit,
      offset,
    };
  }
}
