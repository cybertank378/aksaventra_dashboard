import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetValidationTrendUseCase } from "@/modules/dashboards/application/usecase/GetValidationTrendUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetValidationTrendUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let useCase: GetValidationTrendUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    useCase = new GetValidationTrendUseCase(mockRepo, clock);
  });

  it("should return 4 series with continuous time series points", async () => {
    // Arrange: 7-day range
    vi.mocked(mockRepo.aggregateValidationOutcomes).mockResolvedValue([
      { bucket: "2026-10-28", result: "VERIFIED", count: 15 },
      { bucket: "2026-10-28", result: "HWID_MISMATCH", count: 2 },
    ]);

    // Act
    const result = await useCase.execute({ range: "7d" });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.range).toBe("7d");
    expect(data.granularity).toBe("day");
    expect(data.series).toHaveLength(4);

    const verifiedSeries = data.series.find((s) => s.key === "verified");
    expect(verifiedSeries).toBeDefined();
    expect(verifiedSeries?.total).toBe(15);
    // 7 days -> 8 points because inclusive of end day
    expect(verifiedSeries?.points.length).toBeGreaterThanOrEqual(7);

    const mismatchSeries = data.series.find((s) => s.key === "mismatch");
    expect(mismatchSeries?.total).toBe(2);

    const activatedSeries = data.series.find((s) => s.key === "activated");
    expect(activatedSeries?.total).toBe(0);
  });
});
