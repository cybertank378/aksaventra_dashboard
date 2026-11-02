import { describe, expect, it, vi } from "vitest";
import { PurgeExpiredLogsUseCase } from "../../application/usecase/PurgeExpiredLogsUseCase";
import {
  createMockSystemConfigurationEntity,
  createMockSystemSettingsRepository,
} from "../mocks/mockSystemSettingsFactories";

describe("PurgeExpiredLogsUseCase", () => {
  it("should calculate cutoff dates and trigger repository purge", async () => {
    // Arrange
    const repository = createMockSystemSettingsRepository();
    const entity = createMockSystemConfigurationEntity();
    repository.getAllSettings = async () => entity;
    const purgeSpy = vi.fn().mockResolvedValue({
      purgedValidationLogsCount: 20,
      purgedUpdateLogsCount: 5,
      totalPurgedCount: 25,
      purgedBeforeDate: new Date().toISOString(),
    });
    repository.purgeExpiredLogs = purgeSpy;

    const useCase = new PurgeExpiredLogsUseCase(repository);

    // Act
    const result = await useCase.execute(
      { target: "ALL", confirm: true },
      "user-admin-1",
      "127.0.0.1",
    );

    // Assert
    expect(purgeSpy).toHaveBeenCalledTimes(1);
    expect(result.totalPurgedCount).toBe(25);
    expect(result.purgedValidationLogsCount).toBe(20);
    expect(result.purgedUpdateLogsCount).toBe(5);
  });

  it("should reject purge if confirm flag is false", async () => {
    // Arrange
    const repository = createMockSystemSettingsRepository();
    const useCase = new PurgeExpiredLogsUseCase(repository);

    // Act & Assert
    await expect(useCase.execute({ target: "ALL", confirm: false })).rejects.toThrow(
      /Konfirmasi pembersihan log diperlukan/,
    );
  });
});
