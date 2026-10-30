import { beforeEach, describe, expect, it, vi } from "vitest";
import { PruneValidationLogsUseCase } from "../../application/usecase/PruneValidationLogsUseCase";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";

describe("PruneValidationLogsUseCase (Triple A Pattern)", () => {
  let mockRepo: ValidationLogRepositoryInterface;
  let useCase: PruneValidationLogsUseCase;

  beforeEach(() => {
    mockRepo = {
      findManyWithFilter: vi.fn(),
      getStats24h: vi.fn(),
      findById: vi.fn(),
      exportLogs: vi.fn(),
      pruneLogsOlderThan: vi.fn(),
    };
    useCase = new PruneValidationLogsUseCase(mockRepo);
  });

  it("should successfully prune logs older than 90 days by default", async () => {
    // Arrange
    const cutoff = new Date("2026-07-30T00:00:00Z");
    vi.mocked(mockRepo.pruneLogsOlderThan).mockResolvedValue({
      deletedCount: 1420,
      cutoffDate: cutoff,
    });

    // Act
    const result = await useCase.execute({});

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.pruneLogsOlderThan).toHaveBeenCalledWith(90);
    expect(result.getValue().deletedCount).toBe(1420);
  });

  it("should reject prune requests with retention less than 7 days for security audit trail", async () => {
    // Arrange & Act
    const result = await useCase.execute({ days: 3 });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toContain("minimal adalah 7 hari");
    expect(mockRepo.pruneLogsOlderThan).not.toHaveBeenCalled();
  });
});
