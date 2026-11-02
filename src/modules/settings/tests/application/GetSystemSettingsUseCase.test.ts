import { describe, expect, it } from "vitest";
import { GetSystemSettingsUseCase } from "../../application/usecase/GetSystemSettingsUseCase";
import {
  createMockDiagnosticsProvider,
  createMockSystemConfigurationEntity,
  createMockSystemSettingsRepository,
} from "../mocks/mockSystemSettingsFactories";

describe("GetSystemSettingsUseCase", () => {
  it("should return complete system settings and diagnostics", async () => {
    // Arrange
    const repository = createMockSystemSettingsRepository();
    const entity = createMockSystemConfigurationEntity();
    repository.getAllSettings = async () => entity;
    const diagnosticsProvider = createMockDiagnosticsProvider();
    const useCase = new GetSystemSettingsUseCase(repository, diagnosticsProvider);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toBeDefined();
    expect(result.licenseEngine.expiringSoonThresholdDays).toBe(30);
    expect(result.securityAuth.maxFailedLoginAttempts).toBe(5);
    expect(result.retentionAudit.validationLogRetentionDays).toBe(180);
    expect(result.diagnostics.storageDriver).toBe("local");
    expect(result.diagnostics.targetSlaLatencyMs).toBe(200);
    expect(result.lastUpdatedByName).toBe("Super Admin");
  });
});
