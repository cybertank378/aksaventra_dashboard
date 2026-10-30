import { describe, expect, it } from "vitest";
import { SystemSettingsValidator } from "../../infrastructure/validators/systemSettings.validator";

describe("SystemSettingsValidator", () => {
  describe("validateUpdate", () => {
    it("should accept valid payload for LICENSE_ENGINE", () => {
      // Arrange
      const body = {
        category: "LICENSE_ENGINE",
        licenseEngine: {
          expiringSoonThresholdDays: 20,
          defaultReleaseChannel: "BETA",
          enforceBinaryIntegrityCheck: true,
          blockOutdatedEngineClients: true,
          validationRateLimitPerMin: 120,
          maintenanceMode: false,
        },
      };

      // Act
      const result = SystemSettingsValidator.validateUpdate(body);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.category).toBe("LICENSE_ENGINE");
      expect(result.data?.licenseEngine?.expiringSoonThresholdDays).toBe(20);
    });

    it("should reject invalid category", () => {
      // Arrange
      const body = {
        category: "INVALID_CAT",
      };

      // Act
      const result = SystemSettingsValidator.validateUpdate(body);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Kategori pengaturan tidak valid");
    });

    it("should reject values violating bounds", () => {
      // Arrange
      const body = {
        category: "SECURITY_AUTH",
        securityAuth: {
          maxFailedLoginAttempts: 1, // min is 3
        },
      };

      // Act
      const result = SystemSettingsValidator.validateUpdate(body);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("antara 3 dan 15");
    });
  });

  describe("validateReset", () => {
    it("should accept valid category for reset", () => {
      // Arrange
      const body = { category: "RETENTION_AUDIT" };

      // Act
      const result = SystemSettingsValidator.validateReset(body);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.category).toBe("RETENTION_AUDIT");
    });

    it("should reject non-object body", () => {
      // Arrange & Act
      const result = SystemSettingsValidator.validateReset(null);

      // Assert
      expect(result.isValid).toBe(false);
    });
  });

  describe("validatePurge", () => {
    it("should accept valid purge request with confirm true", () => {
      // Arrange
      const body = { target: "ALL", confirm: true };

      // Act
      const result = SystemSettingsValidator.validatePurge(body);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.target).toBe("ALL");
      expect(result.data?.confirm).toBe(true);
    });

    it("should reject purge request if confirm is not true", () => {
      // Arrange
      const body = { target: "ALL", confirm: false };

      // Act
      const result = SystemSettingsValidator.validatePurge(body);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain("Konfirmasi pembersihan log diperlukan");
    });
  });
});
