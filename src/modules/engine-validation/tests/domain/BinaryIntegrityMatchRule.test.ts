import { describe, expect, it } from "vitest";
import { BinaryIntegrityMatchRule } from "@/modules/engine-validation/domain/rules/BinaryIntegrityMatchRule";
import { createMockReleaseRecord } from "@/modules/engine-validation/tests/mocks/mockEngineMonitorFactories";

describe("BinaryIntegrityMatchRule (Triple A Pattern)", () => {
  const activeRelease = createMockReleaseRecord({
    version: "v2.2.2",
    checksumSha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    isActive: true,
  });

  it("should return VALID and isTrusted=true when hash matches active release", () => {
    // Arrange
    const providedHash = "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945";

    // Act
    const result = BinaryIntegrityMatchRule.evaluate(providedHash, activeRelease);

    // Assert
    expect(result.outcome).toBe("VALID");
    expect(result.isTrusted).toBe(true);
    expect(result.expectedHash).toBe(activeRelease.checksumSha256);
  });

  it("should be case-insensitive for hex sha256 hash matching", () => {
    // Arrange
    const uppercaseHash = "4F53CDA18C2BAA0C0354BB5F9A3ECBE5ED12AB4D8E11BA873C2F11161202B945";

    // Act
    const result = BinaryIntegrityMatchRule.evaluate(uppercaseHash, activeRelease);

    // Assert
    expect(result.outcome).toBe("VALID");
    expect(result.isTrusted).toBe(true);
  });

  it("should return HASH_MISMATCH and isTrusted=false when hash is tampered/different", () => {
    // Arrange
    const alteredHash = "111111118c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945";

    // Act
    const result = BinaryIntegrityMatchRule.evaluate(alteredHash, activeRelease);

    // Assert
    expect(result.outcome).toBe("HASH_MISMATCH");
    expect(result.isTrusted).toBe(false);
    expect(result.expectedHash).toBe(activeRelease.checksumSha256);
  });

  it("should return REVOKED when release is found and hash matches but isActive is false", () => {
    // Arrange
    const revokedRelease = createMockReleaseRecord({
      isActive: false,
    });
    const providedHash = revokedRelease.checksumSha256;

    // Act
    const result = BinaryIntegrityMatchRule.evaluate(providedHash, revokedRelease);

    // Assert
    expect(result.outcome).toBe("REVOKED");
    expect(result.isTrusted).toBe(false);
  });

  it("should return UNKNOWN_VERSION when release record is null", () => {
    // Arrange
    const providedHash = "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945";

    // Act
    const result = BinaryIntegrityMatchRule.evaluate(providedHash, null);

    // Assert
    expect(result.outcome).toBe("UNKNOWN_VERSION");
    expect(result.isTrusted).toBe(false);
    expect(result.expectedHash).toBeNull();
  });
});
