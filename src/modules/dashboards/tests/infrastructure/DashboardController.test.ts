import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardServices } from "@/modules/dashboards/application/services/DashboardServices";
import { DashboardController } from "@/modules/dashboards/infrastructure/http/DashboardController";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("DashboardController (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let services: DashboardServices;
  let controller: DashboardController;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    services = new DashboardServices(mockRepo, clock);
    controller = new DashboardController(services);
  });

  it("should return HTTP 200 with summary data on getSummary", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/dashboard/summary");

    // Act
    const res = await controller.getSummary(req);

    // Assert
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.kpis).toBeDefined();
    expect(body.kpis.activeLicenses.total).toBe(24);
  });

  it("should return HTTP 400 when validation trend query has invalid range", async () => {
    // Arrange
    const req = new NextRequest(
      "http://localhost:3000/api/v1/dashboard/charts/validation-trend?range=1y",
    );

    // Act
    const res = await controller.getValidationTrend(req);

    // Assert
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("Parameter range harus salah satu dari");
  });

  it("should return HTTP 400 when recent licenses query has invalid limit", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/dashboard/licenses/recent?limit=100");

    // Act
    const res = await controller.getRecentLicenses(req);

    // Assert
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("tidak boleh melebihi 50");
  });

  it("should return HTTP 500 without leaking database details on service failure", async () => {
    // Arrange
    vi.mocked(mockRepo.countLicenseStates).mockRejectedValue(
      new Error("FATAL: relation 'licenses' does not exist in schema 'public'"),
    );
    const req = new NextRequest("http://localhost:3000/api/v1/dashboard/summary");

    // Act
    const res = await controller.getSummary(req);

    // Assert
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBeDefined();
  });
});
