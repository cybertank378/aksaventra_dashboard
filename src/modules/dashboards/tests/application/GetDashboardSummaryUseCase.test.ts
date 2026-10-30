import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetDashboardSummaryUseCase } from "@/modules/dashboards/application/usecase/GetDashboardSummaryUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetDashboardSummaryUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let useCase: GetDashboardSummaryUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    useCase = new GetDashboardSummaryUseCase(mockRepo, clock);
  });

  it("should return successfully assembled KPI summary and renewal warnings", async () => {
    // Arrange
    vi.mocked(mockRepo.countLicenseStates).mockResolvedValue({
      active: 25,
      expiringSoon: 4,
      expired: 2,
      suspended: 1,
      activeWithHwid: 20,
    });
    vi.mocked(mockRepo.countLicensesCreatedBetween)
      .mockResolvedValueOnce(25)
      .mockResolvedValueOnce(20);
    vi.mocked(mockRepo.findExpiringLicenses).mockResolvedValue([
      {
        id: "lic-exp-1",
        clientName: "PT Sentosa",
        serialKey: "AKSA-2026-SENT-1111",
        expiresAt: new Date("2026-11-03T00:00:00Z"),
      },
    ]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.kpis.activeLicenses.total).toBe(25);
    expect(data.kpis.activeLicenses.growthRate).toBe(25.0);
    expect(data.kpis.expiringLicenses.total).toBe(4);
    expect(data.kpis.expiredOrRevoked.total).toBe(3);
    expect(data.kpis.hwidUtilization.rate).toBe(80.0);
    expect(data.renewalWarnings).toHaveLength(1);
    expect(data.renewalWarnings[0].serialKeyMasked).toBe("AKSA-••••-••••-1111");
  });

  it("should return failure result when repository throws an error", async () => {
    // Arrange
    vi.mocked(mockRepo.countLicenseStates).mockRejectedValue(new Error("Database offline"));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toContain("Database offline");
  });
});
