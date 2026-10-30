import { describe, expect, it, vi } from "vitest";
import { UpdateSystemSettingsUseCase } from "../../application/usecase/UpdateSystemSettingsUseCase";
import {
  createMockDiagnosticsProvider,
  createMockSystemConfigurationEntity,
  createMockSystemSettingsRepository,
} from "../mocks/mockSystemSettingsFactories";

describe("UpdateSystemSettingsUseCase", () => {
  it("should update settings, persist diffs, and return updated settings", async () => {
    // Arrange
    const repository = createMockSystemSettingsRepository();
    const entity = createMockSystemConfigurationEntity();
    repository.getAllSettings = async () => entity;
    const saveSpy = vi.fn().mockResolvedValue(undefined);
    repository.saveSettings = saveSpy;

    const diagnosticsProvider = createMockDiagnosticsProvider();
    const useCase = new UpdateSystemSettingsUseCase(repository, diagnosticsProvider);

    const updateDTO = {
      category: "LICENSE_ENGINE" as const,
      licenseEngine: {
        expiringSoonThresholdDays: 45,
      },
    };

    // Act
    const result = await useCase.execute(updateDTO, "user-admin-1", "127.0.0.1");

    // Assert
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(result.licenseEngine.expiringSoonThresholdDays).toBe(45);
  });

  it("should throw error if bounds validation fails during update", async () => {
    // Arrange
    const repository = createMockSystemSettingsRepository();
    const diagnosticsProvider = createMockDiagnosticsProvider();
    const useCase = new UpdateSystemSettingsUseCase(repository, diagnosticsProvider);

    const invalidDTO = {
      category: "LICENSE_ENGINE" as const,
      licenseEngine: {
        expiringSoonThresholdDays: 999, // out of bounds
      },
    };

    // Act & Assert
    await expect(useCase.execute(invalidDTO)).rejects.toThrow(/antara 7 dan 90/);
  });
});
