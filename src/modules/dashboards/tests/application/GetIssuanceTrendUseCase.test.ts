import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetIssuanceTrendUseCase } from "@/modules/dashboards/application/usecase/GetIssuanceTrendUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("GetIssuanceTrendUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let useCase: GetIssuanceTrendUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    useCase = new GetIssuanceTrendUseCase(mockRepo, clock);
  });

  it("should return 6 month buckets with Indonesian labels for issued and activated series", async () => {
    // Arrange
    vi.mocked(mockRepo.aggregateLicensesIssued).mockResolvedValue([
      { bucket: "2026-10", count: 12 },
    ]);
    vi.mocked(mockRepo.aggregateLicensesActivated).mockResolvedValue([
      { bucket: "2026-10", count: 8 },
    ]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.granularity).toBe("month");
    expect(data.series).toHaveLength(2);

    const issued = data.series.find((s) => s.key === "issued");
    expect(issued).toBeDefined();
    expect(issued?.points).toHaveLength(6);
    expect(issued?.total).toBe(12);

    const octPoint = issued?.points.find((p) => p.bucket === "2026-10");
    expect(octPoint?.label).toContain("Okt");
  });
});
