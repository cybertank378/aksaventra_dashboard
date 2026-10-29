import type {
  RawAuditLogRecord,
  RawLicenseRecord,
} from "@/modules/dashboards/domain/mapper/DashboardMapper";
import type { ChartGranularity } from "@/modules/dashboards/domain/types/ChartGranularity";
import type { DashboardLicenseState } from "@/modules/dashboards/domain/types/DashboardLicenseState";
import type { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";

export interface LicenseStateCounts {
  active: number;
  expiringSoon: number;
  expired: number;
  suspended: number;
  activeWithHwid: number;
}

export interface ExpiringLicenseRecord {
  id: string;
  clientName: string;
  serialKey: string;
  expiresAt: Date;
}

export interface RecentLicensesQuery {
  status: DashboardLicenseState | "ALL";
  offset: number;
  limit: number;
}

export interface PaginatedRecords<T> {
  items: T[];
  total: number;
  statusCounts: {
    ALL: number;
    ACTIVE: number;
    EXPIRING_SOON: number;
    EXPIRED: number;
    SUSPENDED: number;
  };
}

export interface ValidationOutcomeBucketRecord {
  bucket: string;
  result: string;
  count: number;
}

export interface MonthlyCountRecord {
  bucket: string; // YYYY-MM
  count: number;
}

export interface DashboardRepositoryInterface {
  // KPI, Banner & Summary
  countLicenseStates(now: Date, expiringUntil: Date): Promise<LicenseStateCounts>;
  countLicensesCreatedBetween(range: DateRange): Promise<number>;
  findExpiringLicenses(
    now: Date,
    expiringUntil: Date,
    limit: number,
  ): Promise<ExpiringLicenseRecord[]>;

  // Recent Tables & Activities
  findRecentLicenses(
    query: RecentLicensesQuery,
    now: Date,
    expiringDays?: number,
  ): Promise<PaginatedRecords<RawLicenseRecord>>;
  findRecentActivities(limit: number): Promise<RawAuditLogRecord[]>;

  // Analytical Charts
  aggregateValidationOutcomes(
    range: DateRange,
    granularity: ChartGranularity,
    timezone: string,
  ): Promise<ValidationOutcomeBucketRecord[]>;
  aggregateLicensesIssued(range: DateRange, timezone: string): Promise<MonthlyCountRecord[]>;
  aggregateLicensesActivated(range: DateRange, timezone: string): Promise<MonthlyCountRecord[]>;
  aggregateLicensesExpiring(
    range: DateRange,
    now: Date,
    timezone: string,
  ): Promise<MonthlyCountRecord[]>;
}
