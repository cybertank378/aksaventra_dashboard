import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExportValidationLogsUseCase } from "../../application/usecase/ExportValidationLogsUseCase";
import { ValidationLogReadEntity } from "../../domain/entity/ValidationLogReadEntity";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";

describe("ExportValidationLogsUseCase (Triple A Pattern)", () => {
  let mockRepo: ValidationLogRepositoryInterface;
  let useCase: ExportValidationLogsUseCase;

  beforeEach(() => {
    mockRepo = {
      findManyWithFilter: vi.fn(),
      getStats24h: vi.fn(),
      findById: vi.fn(),
      exportLogs: vi.fn(),
      pruneLogsOlderThan: vi.fn(),
    };
    useCase = new ExportValidationLogsUseCase(mockRepo);
  });

  it("should generate CSV buffer and filename on success", async () => {
    // Arrange
    const sampleLog = ValidationLogReadEntity.create({
      id: "log-1",
      licenseId: "lic-1",
      clientName: "PT Nusantara",
      serialKeyHint: "ABCD",
      hwidHash: "hash-sha256",
      result: "VERIFIED",
      statusCode: 200,
      engineVersion: "v2.2.2",
      clientIp: "127.0.0.1",
      userAgent: "AksaventraEngine/2.2.2",
      latencyMs: 32,
      checkedAt: new Date("2026-10-30T00:00:00Z"),
    });

    vi.mocked(mockRepo.exportLogs).mockResolvedValue([sampleLog]);

    // Act
    const result = await useCase.execute({});

    // Assert
    expect(result.isSuccess).toBe(true);
    const value = result.getValue();
    expect(value.filename).toContain("validation-logs-");
    expect(value.filename).toContain(".csv");
    expect(value.contentType).toBe("text/csv; charset=utf-8");
    expect(value.buffer).toBeInstanceOf(Buffer);
    const csvContent = value.buffer.toString("utf-8");
    expect(csvContent).toContain("PT Nusantara");
    expect(csvContent).toContain("AKSA-••••-••••-ABCD");
    expect(csvContent).toContain("VERIFIED");
  });
});
