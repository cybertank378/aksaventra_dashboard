import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetLicenseStatusDistributionUseCase } from "@/modules/dashboards/application/usecase/GetLicenseStatusDistributionUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetLicenseStatusDistributionUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let useCase: GetLicenseStatusDistributionUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    useCase = new GetLicenseStatusDistributionUseCase(mockRepo, clock);
  });

  it("should return calculated distribution slices with percentages summing to approx 100", async () => {
    // Arrange
    vi.mocked(mockRepo.countLicenseStates).mockResolvedValue({
      active: 50,
      expiringSoon: 25,
      expired: 15,
      suspended: 10,
      activeWithHwid: 40,
    });

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.total).toBe(100);
    expect(data.slices).toHaveLength(4);

    const activeSlice = data.slices.find((s) => s.key === "ACTIVE");
    expect(activeSlice?.value).toBe(50);
    expect(activeSlice?.percent).toBe(50.0);

    const expiringSlice = data.slices.find((s) => s.key === "EXPIRING_SOON");
    expect(expiringSlice?.value).toBe(25);
    expect(expiringSlice?.percent).toBe(25.0);
  });
});
