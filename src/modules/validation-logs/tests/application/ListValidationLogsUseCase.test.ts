import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListValidationLogsUseCase } from "../../application/usecase/ListValidationLogsUseCase";
import { ValidationLogReadEntity } from "../../domain/entity/ValidationLogReadEntity";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";

describe("ListValidationLogsUseCase (Triple A Pattern)", () => {
  let mockRepo: ValidationLogRepositoryInterface;
  let useCase: ListValidationLogsUseCase;

  beforeEach(() => {
    mockRepo = {
      findManyWithFilter: vi.fn(),
      getStats24h: vi.fn(),
      findById: vi.fn(),
      exportLogs: vi.fn(),
      pruneLogsOlderThan: vi.fn(),
    };
    useCase = new ListValidationLogsUseCase(mockRepo);
  });

  it("should return paginated and masked validation log items on success", async () => {
    // Arrange
    const sampleLog = ValidationLogReadEntity.create({
      id: "log-1",
      licenseId: "lic-1",
      clientName: "PT Teknologi Nusantara",
      serialKeyHint: "9F2A",
      hwidHash: "8f1c2b3a4d5e6f7a",
      result: "VERIFIED",
      statusCode: 200,
      engineVersion: "v2.2.2",
      clientIp: "103.14.20.1",
      userAgent: "AksaventraEngine/2.2.2",
      latencyMs: 38,
      checkedAt: new Date("2026-10-30T00:42:00Z"),
    });

    vi.mocked(mockRepo.findManyWithFilter).mockResolvedValue({
      data: [sampleLog],
      total: 1,
    });

    // Act
    const result = await useCase.execute({ page: 1, limit: 15 });

    // Assert
    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.logs.length).toBe(1);
    expect(value.logs[0].serialKeyMasked).toBe("AKSA-••••-••••-9F2A");
    expect(value.logs[0].isSlaBreached).toBe(false);
    expect(value.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 15,
      totalPages: 1,
    });
  });

  it("should return failure when repository throws an error", async () => {
    // Arrange
    vi.mocked(mockRepo.findManyWithFilter).mockRejectedValue(new Error("Database connection lost"));

    // Act
    const result = await useCase.execute({});

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Database connection lost");
  });
});
