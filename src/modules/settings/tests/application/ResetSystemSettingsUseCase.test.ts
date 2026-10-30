import { describe, expect, it, vi } from "vitest";
import { ResetSystemSettingsUseCase } from "../../application/usecase/ResetSystemSettingsUseCase";
import {
  createMockDiagnosticsProvider,
  createMockSystemConfigurationEntity,
  createMockSystemSettingsRepository,
} from "../mocks/mockSystemSettingsFactories";

describe("ResetSystemSettingsUseCase", () => {
  it("should reset specified category to factory defaults and save diffs", async () => {
    // Arrange
    const repository = createMockSystemSettingsRepository();
    const entity = createMockSystemConfigurationEntity();
    entity.updateSecurityAuth({ maxFailedLoginAttempts: 12 });
    repository.getAllSettings = async () => entity;
    const resetSpy = vi.fn().mockResolvedValue(undefined);
    repository.resetSettings = resetSpy;

    const diagnosticsProvider = createMockDiagnosticsProvider();
    const useCase = new ResetSystemSettingsUseCase(repository, diagnosticsProvider);

    // Act
    const result = await useCase.execute(
      { category: "SECURITY_AUTH" },
      "user-admin-1",
      "127.0.0.1",
    );

    // Assert
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(result.securityAuth.maxFailedLoginAttempts).toBe(5);
  });
});
