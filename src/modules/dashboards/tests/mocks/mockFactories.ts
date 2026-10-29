import { vi } from "vitest";
import type { ClockInterface } from "@/modules/dashboards/domain/interfaces/ClockInterface";
import type { DashboardRepositoryInterface } from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";

export class FixedClockProvider implements ClockInterface {
  constructor(private readonly fixedDate: Date = new Date("2026-10-29T10:00:00Z")) {}

  public now(): Date {
    return new Date(this.fixedDate.getTime());
  }
}

export function createMockDashboardRepository(): DashboardRepositoryInterface {
  return {
    countLicenseStates: vi.fn().mockResolvedValue({
      active: 24,
      expiringSoon: 3,
      expired: 4,
      suspended: 2,
      activeWithHwid: 20,
    }),
    countLicensesCreatedBetween: vi.fn().mockResolvedValue(10),
    findExpiringLicenses: vi.fn().mockResolvedValue([]),
    findRecentLicenses: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      statusCounts: {
        ALL: 0,
        ACTIVE: 0,
        EXPIRING_SOON: 0,
        EXPIRED: 0,
        SUSPENDED: 0,
      },
    }),
    findRecentActivities: vi.fn().mockResolvedValue([]),
    aggregateValidationOutcomes: vi.fn().mockResolvedValue([]),
    aggregateLicensesIssued: vi.fn().mockResolvedValue([]),
    aggregateLicensesActivated: vi.fn().mockResolvedValue([]),
    aggregateLicensesExpiring: vi.fn().mockResolvedValue([]),
  };
}
