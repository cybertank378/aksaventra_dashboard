import { describe, expect, it } from "vitest";
import { createMockSystemConfigurationEntity } from "../mocks/mockSystemSettingsFactories";

describe("SystemConfigurationEntity", () => {
  it("should update license engine settings and return correct diffs", () => {
    // Arrange
    const entity = createMockSystemConfigurationEntity();

    // Act
    const diffs = entity.updateLicenseEngine({
      expiringSoonThresholdDays: 45,
      defaultReleaseChannel: "BETA",
    });

    // Assert
    expect(entity.licenseEngine.expiringSoonThresholdDays).toBe(45);
    expect(entity.licenseEngine.defaultReleaseChannel).toBe("BETA");
    expect(diffs).toEqual([
      {
        key: "expiringSoonThresholdDays",
        previousValue: 30,
        newValue: 45,
      },
      {
        key: "defaultReleaseChannel",
        previousValue: "STABLE",
        newValue: "BETA",
      },
    ]);
  });

  it("should throw error when updating with invalid bounds", () => {
    // Arrange
    const entity = createMockSystemConfigurationEntity();

    // Act & Assert
    expect(() => {
      entity.updateLicenseEngine({
        expiringSoonThresholdDays: 2, // below min 7
      });
    }).toThrow(/antara 7 dan 90/);
  });

  it("should reset category to default values and return diffs", () => {
    // Arrange
    const entity = createMockSystemConfigurationEntity();
    entity.updateSecurityAuth({ maxFailedLoginAttempts: 10 });

    // Act
    const diffs = entity.resetCategory("SECURITY_AUTH");

    // Assert
    expect(entity.securityAuth.maxFailedLoginAttempts).toBe(5);
    expect(diffs).toEqual([
      {
        key: "maxFailedLoginAttempts",
        previousValue: 10,
        newValue: 5,
      },
    ]);
  });

  it("should calculate correct purge cutoff date based on retention days", () => {
    // Arrange
    const entity = createMockSystemConfigurationEntity();
    const now = Date.now();

    // Act
    const cutoff = entity.calculateValidationLogPurgeCutoff();

    // Assert
    // 180 days in ms = 180 * 24 * 60 * 60 * 1000 = 15,552,000,000 ms
    const diffMs = now - cutoff.getTime();
    const expectedMs = 180 * 24 * 60 * 60 * 1000;
    expect(Math.abs(diffMs - expectedMs)).toBeLessThan(1000);
  });
});
