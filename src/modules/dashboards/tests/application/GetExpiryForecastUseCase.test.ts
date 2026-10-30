import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetExpiryForecastUseCase } from "@/modules/dashboards/application/usecase/GetExpiryForecastUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetExpiryForecastUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let useCase: GetExpiryForecastUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    useCase = new GetExpiryForecastUseCase(mockRepo, clock);
  });

  it("should return 6 future monthly projection buckets", async () => {
    // Arrange
    vi.mocked(mockRepo.aggregateLicensesExpiring).mockResolvedValue([
      { bucket: "2026-11", count: 5 },
      { bucket: "2026-12", count: 9 },
    ]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.granularity).toBe("month");
    expect(data.series).toHaveLength(1);

    const expiring = data.series[0];
    expect(expiring.points).toHaveLength(6);
    expect(expiring.total).toBe(14);
  });
});
