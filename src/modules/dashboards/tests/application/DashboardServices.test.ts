import { beforeEach, describe, expect, it } from "vitest";
import { DashboardServices } from "@/modules/dashboards/application/services/DashboardServices";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("DashboardServices (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let services: DashboardServices;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    services = new DashboardServices(mockRepo, clock);
  });

  it("should delegate getSummary through BaseService.execute", async () => {
    const result = await services.getSummary();
    expect(result.isSuccess).toBe(true);
  });

  it("should delegate getRecentLicenses through BaseService.execute", async () => {
    const result = await services.getRecentLicenses();
    expect(result.isSuccess).toBe(true);
  });

  it("should delegate getRecentActivities through BaseService.execute", async () => {
    const result = await services.getRecentActivities();
    expect(result.isSuccess).toBe(true);
  });

  it("should delegate getValidationTrend through BaseService.execute", async () => {
    const result = await services.getValidationTrend();
    expect(result.isSuccess).toBe(true);
  });

  it("should delegate getLicenseStatusDistribution through BaseService.execute", async () => {
    const result = await services.getLicenseStatusDistribution();
    expect(result.isSuccess).toBe(true);
  });

  it("should delegate getIssuanceTrend through BaseService.execute", async () => {
    const result = await services.getIssuanceTrend();
    expect(result.isSuccess).toBe(true);
  });

  it("should delegate getExpiryForecast through BaseService.execute", async () => {
    const result = await services.getExpiryForecast();
    expect(result.isSuccess).toBe(true);
  });
});
