import { describe, expect, it } from "vitest";
import { SettingsBoundsRule } from "../../domain/rules/SettingsBoundsRule";

describe("SettingsBoundsRule", () => {
  describe("validateLicenseEngine", () => {
    it("should pass when all values are within allowed bounds", () => {
      // Arrange
      const validSettings = {
        expiringSoonThresholdDays: 30,
        defaultReleaseChannel: "STABLE" as const,
        validationRateLimitPerMin: 60,
      };

      // Act
      const result = SettingsBoundsRule.validateLicenseEngine(validSettings);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject expiringSoonThresholdDays below 7 or above 90", () => {
      // Arrange
      const tooLow = { expiringSoonThresholdDays: 5 };
      const tooHigh = { expiringSoonThresholdDays: 100 };

      // Act
      const resultLow = SettingsBoundsRule.validateLicenseEngine(tooLow);
      const resultHigh = SettingsBoundsRule.validateLicenseEngine(tooHigh);

      // Assert
      expect(resultLow.isValid).toBe(false);
      expect(resultLow.errors[0]).toContain("antara 7 dan 90");
      expect(resultHigh.isValid).toBe(false);
    });

    it("should reject invalid defaultReleaseChannel", () => {
      // Arrange
      const invalidChannel = { defaultReleaseChannel: "ALPHA" };

      // Act
      const result = SettingsBoundsRule.validateLicenseEngine(invalidChannel);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("STABLE, BETA, NIGHTLY");
    });

    it("should reject validationRateLimitPerMin below 10 or above 1000", () => {
      // Arrange
      const invalid = { validationRateLimitPerMin: 5 };

      // Act
      const result = SettingsBoundsRule.validateLicenseEngine(invalid);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("antara 10 dan 1000");
    });
  });

  describe("validateSecurityAuth", () => {
    it("should pass when security settings are within bounds", () => {
      // Arrange
      const valid = {
        maxFailedLoginAttempts: 5,
        accountLockoutMinutes: 30,
        sessionTtlHours: 24,
      };

      // Act
      const result = SettingsBoundsRule.validateSecurityAuth(valid);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject maxFailedLoginAttempts out of 3-15 range", () => {
      // Arrange
      const tooLow = { maxFailedLoginAttempts: 2 };

      // Act
      const result = SettingsBoundsRule.validateSecurityAuth(tooLow);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("antara 3 dan 15");
    });

    it("should reject accountLockoutMinutes out of 5-1440 range", () => {
      // Arrange
      const tooLow = { accountLockoutMinutes: 2 };

      // Act
      const result = SettingsBoundsRule.validateSecurityAuth(tooLow);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("antara 5 dan 1440");
    });

    it("should reject sessionTtlHours out of 1-168 range", () => {
      // Arrange
      const tooHigh = { sessionTtlHours: 200 };

      // Act
      const result = SettingsBoundsRule.validateSecurityAuth(tooHigh);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("antara 1 dan 168");
    });
  });

  describe("validateRetentionAudit", () => {
    it("should pass when retention days are within safe bounds", () => {
      // Arrange
      const valid = {
        validationLogRetentionDays: 180,
        updateLogRetentionDays: 90,
      };

      // Act
      const result = SettingsBoundsRule.validateRetentionAudit(valid);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject validationLogRetentionDays below 30 to prevent accidental data loss", () => {
      // Arrange
      const tooLow = { validationLogRetentionDays: 15 };

      // Act
      const result = SettingsBoundsRule.validateRetentionAudit(tooLow);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("antara 30 dan 730");
    });
  });
});
