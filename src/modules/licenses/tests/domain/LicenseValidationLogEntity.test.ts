import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { LicenseValidationLogEntity } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";

describe("LicenseValidationLogEntity (Triple A Pattern)", () => {
  it("should extract last 4 characters as serialKeyHint and compute sha256 hwidHash", () => {
    // Arrange
    const rawKey = "AKSA-ENTERPRISE-2026-9F2A";
    const rawHwid = "1caee749-5928-4c89-a052-ca4f27af8c41";
    const expectedHash = crypto.createHash("sha256").update(rawHwid).digest("hex");

    // Act
    const entity = LicenseValidationLogEntity.create({
      licenseId: "lic-uuid-1",
      serialKey: rawKey,
      hwid: rawHwid,
      result: "VERIFIED",
      statusCode: 200,
      engineVersion: "v2.2.1",
      clientIp: "127.0.0.1",
      userAgent: "AksaventraEngine/2.2.1",
      latencyMs: 14,
    });

    // Assert
    expect(entity.serialKeyHint).toBe("9F2A");
    expect(entity.hwidHash).toBe(expectedHash);
    expect(entity.result).toBe("VERIFIED");
    expect(entity.statusCode).toBe(200);
    expect(entity.licenseId).toBe("lic-uuid-1");
    expect(entity.engineVersion).toBe("v2.2.1");
    expect(entity.clientIp).toBe("127.0.0.1");
    expect(entity.userAgent).toBe("AksaventraEngine/2.2.1");
    expect(entity.latencyMs).toBe(14);
    expect(entity.checkedAt).toBeInstanceOf(Date);
  });

  it("should handle empty or null hwid by setting hwidHash to null", () => {
    // Arrange
    const rawKey = "ABCD";

    // Act
    const entity = LicenseValidationLogEntity.create({
      serialKey: rawKey,
      hwid: null,
      result: "BAD_REQUEST",
      statusCode: 400,
    });

    // Assert
    expect(entity.serialKeyHint).toBe("ABCD");
    expect(entity.hwidHash).toBeNull();
    expect(entity.licenseId).toBeNull();
  });

  it("should handle short serial keys gracefully", () => {
    // Arrange
    const rawKey = "XYZ";

    // Act
    const entity = LicenseValidationLogEntity.create({
      serialKey: rawKey,
      result: "NOT_FOUND",
      statusCode: 404,
    });

    // Assert
    expect(entity.serialKeyHint).toBe("XYZ");
    expect(entity.hwidHash).toBeNull();
  });
});
