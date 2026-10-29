import { describe, expect, it } from "vitest";
import { ReleaseValidator } from "@/modules/releases/infrastructure/validators/release.validator";

describe("ReleaseValidator (Triple A Pattern)", () => {
  describe("validateCheckVersion", () => {
    it("should accept valid check version payload with snake_case", () => {
      // Arrange
      const payload = {
        client_version: "v2.2.1",
        hwid: "1caee749-5928-4c89-a052-ca4f27af8c41",
        serial_key: "AKSA-ENTERPRISE-2026-9F2A",
        channel: "stable",
      };

      // Act
      const result = ReleaseValidator.validateCheckVersion(payload);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.client_version).toBe("v2.2.1");
      expect(result.data?.hwid).toBe("1caee749-5928-4c89-a052-ca4f27af8c41");
    });

    it("should accept valid check version payload with camelCase", () => {
      // Arrange
      const payload = {
        clientVersion: "v2.0.0",
        serialKey: "AKSA-TEST-KEY",
      };

      // Act
      const result = ReleaseValidator.validateCheckVersion(payload);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.client_version).toBe("v2.0.0");
      expect(result.data?.serial_key).toBe("AKSA-TEST-KEY");
    });

    it("should reject when client version is missing", () => {
      // Arrange
      const payload = {
        hwid: "1caee749-5928-4c89-a052-ca4f27af8c41",
      };

      // Act
      const result = ReleaseValidator.validateCheckVersion(payload);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.client_version).toBeDefined();
    });
  });

  describe("validateCreateRelease", () => {
    it("should accept valid release creation payload", () => {
      // Arrange
      const payload = {
        version: "v2.2.2",
        channel: "STABLE",
        minSupportedVersion: "v2.0.0",
        mandatory: false,
        checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
        fileSize: 12582912,
        releaseNotes: "Initial auto-updater release",
      };

      // Act
      const result = ReleaseValidator.validateCreateRelease(payload);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.version).toBe("v2.2.2");
      expect(result.data?.fileSize).toBe(BigInt(12582912));
    });

    it("should reject non-SemVer version format", () => {
      // Arrange
      const payload = {
        version: "2.2_invalid",
        checksumSha256: "somehash",
        fileSize: 100,
      };

      // Act
      const result = ReleaseValidator.validateCreateRelease(payload);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.version).toBeDefined();
    });
  });
});
