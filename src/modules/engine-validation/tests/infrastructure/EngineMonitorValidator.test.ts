import { describe, expect, it } from "vitest";
import { EngineMonitorValidator } from "@/modules/engine-validation/infrastructure/validators/engineMonitor.validator";

describe("EngineMonitorValidator (Triple A Pattern)", () => {
  describe("validateLiveFeedQuery", () => {
    it("should parse and sanitize valid query parameters", () => {
      // Arrange
      const searchParams = new URLSearchParams({
        page: "2",
        limit: "50",
        group: "MISMATCH",
        engineVersion: "v2.2.2",
        search: "PT Nusantara",
      });

      // Act
      const result = EngineMonitorValidator.validateLiveFeedQuery(searchParams);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        page: 2,
        limit: 50,
        group: "MISMATCH",
        engineVersion: "v2.2.2",
        search: "PT Nusantara",
      });
    });

    it("should fallback to defaults when parameters are missing or invalid", () => {
      // Arrange
      const searchParams = new URLSearchParams({
        page: "-1",
        limit: "999",
        group: "INVALID_GROUP",
      });

      // Act
      const result = EngineMonitorValidator.validateLiveFeedQuery(searchParams);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(100);
      expect(result.data?.group).toBe("ALL");
    });
  });

  describe("validateVerifyChecksumPayload", () => {
    it("should validate correct version and 64-char sha256 hex payload", () => {
      // Arrange
      const body = {
        version: "v2.2.2",
        sha256Hash: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      };

      // Act
      const result = EngineMonitorValidator.validateVerifyChecksumPayload(body);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data?.version).toBe("v2.2.2");
      expect(result.data?.sha256Hash).toBe(body.sha256Hash);
    });

    it("should fail when sha256 format is invalid or version is missing", () => {
      // Arrange
      const body = {
        version: "",
        sha256Hash: "not-a-valid-sha256",
      };

      // Act
      const result = EngineMonitorValidator.validateVerifyChecksumPayload(body);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.version).toBeDefined();
      expect(result.errors.sha256Hash).toBeDefined();
    });
  });

  describe("validatePatchBinaryStatus", () => {
    it("should validate valid patch status payload", () => {
      // Arrange
      const body = {
        isActive: false,
        reason: "Security revoke",
      };

      // Act
      const result = EngineMonitorValidator.validatePatchBinaryStatus(body, "rel-123");

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        id: "rel-123",
        isActive: false,
        reason: "Security revoke",
      });
    });

    it("should fail when isActive is not a boolean", () => {
      // Arrange
      const body = {
        isActive: "false",
      };

      // Act
      const result = EngineMonitorValidator.validatePatchBinaryStatus(body, "rel-123");

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errors.isActive).toBeDefined();
    });
  });
});
