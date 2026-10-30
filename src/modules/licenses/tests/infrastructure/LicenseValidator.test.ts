import { describe, expect, it } from "vitest";
import { LicenseValidator } from "@/modules/licenses/infrastructure/validators/license.validator";

describe("LicenseValidator (Triple A Pattern)", () => {
  it("should validate and succeed when serial_key and hwid are valid", () => {
    // Arrange
    const input = {
      serial_key: "AKSA-2026-TEST-1234",
      hwid: "DEVICE-HWID-UUID",
      engine_version: "2.1.0",
    };

    // Act
    const result = LicenseValidator.validate(input);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.serial_key).toBe("AKSA-2026-TEST-1234");
    expect(result.data?.hwid).toBe("DEVICE-HWID-UUID");
    expect(result.data?.engine_version).toBe("2.1.0");
  });

  it("should extract public_ip or client_ip when provided in body payload", () => {
    // Arrange
    const input = {
      serial_key: "AKSA-2026-TEST-1234",
      hwid: "DEVICE-HWID-UUID",
      public_ip: "103.14.20.15",
    };

    // Act
    const result = LicenseValidator.validate(input);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.data?.public_ip).toBe("103.14.20.15");
  });

  it("should fail when serial_key is missing or shorter than 8 characters", () => {
    // Arrange
    const inputMissing = { hwid: "DEVICE-HWID" };
    const inputShort = { serial_key: "SHORT", hwid: "DEVICE-HWID" };

    // Act
    const resultMissing = LicenseValidator.validate(inputMissing);
    const resultShort = LicenseValidator.validate(inputShort);

    // Assert
    expect(resultMissing.isValid).toBe(false);
    expect(resultMissing.errors.serial_key).toContain("wajib diisi");
    expect(resultShort.isValid).toBe(false);
    expect(resultShort.errors.serial_key).toContain("minimal 8 karakter");
  });

  it("should fail when hwid is empty or missing", () => {
    // Arrange
    const inputMissing = { serial_key: "AKSA-12345678" };
    const inputEmpty = { serial_key: "AKSA-12345678", hwid: "   " };

    // Act
    const resultMissing = LicenseValidator.validate(inputMissing);
    const resultEmpty = LicenseValidator.validate(inputEmpty);

    // Assert
    expect(resultMissing.isValid).toBe(false);
    expect(resultMissing.errors.hwid).toContain("tidak boleh kosong");
    expect(resultEmpty.isValid).toBe(false);
    expect(resultEmpty.errors.hwid).toContain("tidak boleh kosong");
  });

  it("should fail when payload is not an object", () => {
    // Arrange
    const invalidInput = null;

    // Act
    const result = LicenseValidator.validate(invalidInput);

    // Assert
    expect(result.isValid).toBe(false);
    expect(result.errors.payload).toBeDefined();
  });
});
