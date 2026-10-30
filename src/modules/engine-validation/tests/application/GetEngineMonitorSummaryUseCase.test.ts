import { describe, expect, it, type vi } from "vitest";
import { GetEngineMonitorSummaryUseCase } from "@/modules/engine-validation/application/usecase/GetEngineMonitorSummaryUseCase";
import {
  createMockEngineMonitorRepository,
  createMockSummaryResponse,
} from "@/modules/engine-validation/tests/mocks/mockEngineMonitorFactories";

describe("GetEngineMonitorSummaryUseCase (Triple A Pattern)", () => {
  it("should retrieve aggregated summary metrics successfully", async () => {
    // Arrange
    const expectedSummary = createMockSummaryResponse();
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.getSummaryMetrics as ReturnType<typeof vi.fn>).mockResolvedValue(expectedSummary);
    const useCase = new GetEngineMonitorSummaryUseCase(mockRepo);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(expectedSummary);
    expect(mockRepo.getSummaryMetrics).toHaveBeenCalledTimes(1);
  });

  it("should return failure Result when repository throws an error", async () => {
    // Arrange
    const mockRepo = createMockEngineMonitorRepository();
    (mockRepo.getSummaryMetrics as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Database connection failure"),
    );
    const useCase = new GetEngineMonitorSummaryUseCase(mockRepo);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError()).toContain("Database connection failure");
  });
});
