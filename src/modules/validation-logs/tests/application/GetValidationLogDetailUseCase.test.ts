import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetValidationLogDetailUseCase } from "../../application/usecase/GetValidationLogDetailUseCase";
import { ValidationLogReadEntity } from "../../domain/entity/ValidationLogReadEntity";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";

describe("GetValidationLogDetailUseCase (Triple A Pattern)", () => {
  let mockRepo: ValidationLogRepositoryInterface;
  let useCase: GetValidationLogDetailUseCase;

  beforeEach(() => {
    mockRepo = {
      findManyWithFilter: vi.fn(),
      getStats24h: vi.fn(),
      findById: vi.fn(),
      exportLogs: vi.fn(),
      pruneLogsOlderThan: vi.fn(),
    };
    useCase = new GetValidationLogDetailUseCase(mockRepo);
  });

  it("should return log and license detail when ID exists", async () => {
    // Arrange
    const sampleLog = ValidationLogReadEntity.create({
      id: "log-1",
      licenseId: "lic-1",
      clientName: "PT Nusantara",
      serialKeyHint: "ABCD",
      hwidHash: "hash-sha256",
      result: "ACTIVATED",
      statusCode: 200,
      engineVersion: "v2.2.2",
      clientIp: "127.0.0.1",
      userAgent: "AksaventraEngine/2.2.2",
      latencyMs: 45,
      checkedAt: new Date("2026-10-30T00:00:00Z"),
    });

    vi.mocked(mockRepo.findById).mockResolvedValue({
      log: sampleLog,
      license: {
        id: "lic-1",
        serialKeyHint: "ABCD",
        clientName: "PT Nusantara",
        status: "ACTIVE",
        expiresAt: new Date("2027-10-30T00:00:00Z"),
        currentHwid: "HWID-12345",
      },
    });

    // Act
    const result = await useCase.execute({ id: "log-1" });

    // Assert
    expect(result.isSuccess).toBe(true);
    const val = result.getValue();
    expect(val.log.id).toBe("log-1");
    expect(val.license?.clientName).toBe("PT Nusantara");
  });

  it("should fail when ID is empty or not found", async () => {
    // Arrange & Act
    const emptyResult = await useCase.execute({ id: "" });
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const notFoundResult = await useCase.execute({ id: "non-existent" });

    // Assert
    expect(emptyResult.isSuccess).toBe(false);
    expect(notFoundResult.isSuccess).toBe(false);
    expect(notFoundResult.getError()).toContain("tidak ditemukan");
  });
});
