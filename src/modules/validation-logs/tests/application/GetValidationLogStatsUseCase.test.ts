import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetValidationLogStatsUseCase } from "../../application/usecase/GetValidationLogStatsUseCase";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";

describe("GetValidationLogStatsUseCase (Triple A Pattern)", () => {
  let mockRepo: ValidationLogRepositoryInterface;
  let useCase: GetValidationLogStatsUseCase;

  beforeEach(() => {
    mockRepo = {
      findManyWithFilter: vi.fn(),
      getStats24h: vi.fn(),
      findById: vi.fn(),
      exportLogs: vi.fn(),
      pruneLogsOlderThan: vi.fn(),
    };
    useCase = new GetValidationLogStatsUseCase(mockRepo);
  });

  it("should return calculated 24h validation statistics successfully", async () => {
    // Arrange
    const statsData = {
      totalRequests24h: 14820,
      verifiedCount24h: 14286,
      successRatePercent: 96.4,
      hwidMismatchCount24h: 42,
      rejectedCount24h: 492,
      avgLatencyMs: 38,
    };
    vi.mocked(mockRepo.getStats24h).mockResolvedValue(statsData);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(statsData);
  });

  it("should return failure when repository throws", async () => {
    // Arrange
    vi.mocked(mockRepo.getStats24h).mockRejectedValue(new Error("Timeout"));

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Timeout");
  });
});
