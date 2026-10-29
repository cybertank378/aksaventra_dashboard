import { describe, expect, it } from "vitest";
import { SemVer } from "@/modules/releases/domain/value-object/SemVer";

describe("SemVer Value Object (Triple A Pattern)", () => {
  describe("Parsing and Validation", () => {
    it("should parse standard SemVer with 'v' prefix", () => {
      // Arrange & Act
      const version = SemVer.parse("v2.2.1");

      // Assert
      expect(version.major).toBe(2);
      expect(version.minor).toBe(2);
      expect(version.patch).toBe(1);
      expect(version.prerelease).toBeNull();
      expect(version.raw).toBe("v2.2.1");
    });

    it("should parse SemVer without 'v' prefix", () => {
      // Arrange & Act
      const version = SemVer.parse("1.0.4");

      // Assert
      expect(version.major).toBe(1);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(4);
    });

    it("should parse SemVer with prerelease tag", () => {
      // Arrange & Act
      const version = SemVer.parse("v3.0.0-beta.2");

      // Assert
      expect(version.major).toBe(3);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
      expect(version.prerelease).toBe("beta.2");
    });

    it("should reject invalid SemVer strings", () => {
      // Arrange & Act & Assert
      expect(() => SemVer.parse("invalid")).toThrow();
      expect(() => SemVer.parse("v1.2")).toThrow();
      expect(() => SemVer.parse("")).toThrow();
      expect(SemVer.isValid("2.0.0")).toBe(true);
      expect(SemVer.isValid("v2.0.0")).toBe(true);
      expect(SemVer.isValid("2.0")).toBe(false);
    });
  });

  describe("Comparison", () => {
    it("should correctly compare major versions", () => {
      // Arrange
      const v1 = SemVer.parse("v1.9.9");
      const v2 = SemVer.parse("v2.0.0");

      // Act & Assert
      expect(v2.isGreaterThan(v1)).toBe(true);
      expect(v1.isLessThan(v2)).toBe(true);
      expect(v1.compare(v2)).toBe(-1);
      expect(v2.compare(v1)).toBe(1);
    });

    it("should correctly compare minor and patch versions", () => {
      // Arrange
      const v1 = SemVer.parse("v2.2.1");
      const v2 = SemVer.parse("v2.2.2");

      // Act & Assert
      expect(v2.isGreaterThan(v1)).toBe(true);
      expect(v1.isLessThan(v2)).toBe(true);
      expect(v1.compare(v2)).toBe(-1);
    });

    it("should correctly detect equality", () => {
      // Arrange
      const v1 = SemVer.parse("v2.2.1");
      const v2 = SemVer.parse("2.2.1");

      // Act & Assert
      expect(v1.isEqualTo(v2)).toBe(true);
      expect(v1.isGreaterThanOrEqualTo(v2)).toBe(true);
      expect(v1.isLessThanOrEqualTo(v2)).toBe(true);
      expect(v1.compare(v2)).toBe(0);
    });
  });
});
