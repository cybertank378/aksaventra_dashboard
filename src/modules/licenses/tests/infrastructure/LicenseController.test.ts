import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import type { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseController } from "@/modules/licenses/infrastructure/http/LicenseController";

describe("LicenseController (Triple A Pattern)", () => {
  let mockValidateLicense: ReturnType<typeof vi.fn>;
  let controller: LicenseController;

  beforeEach(() => {
    mockValidateLicense = vi.fn();
    const mockServices = {
      validateLicense: mockValidateLicense,
    } as unknown as LicenseServices;

    controller = new LicenseController(mockServices);
  });

  it("should return HTTP 200 with response payload when validation succeeds", async () => {
    // Arrange
    const payload = {
      serial_key: "AKSA-2026-TEST-VALID",
      hwid: "HWID-TEST-12345",
      engine_version: "2.1.0",
    };
    const req = new NextRequest("http://localhost:3000/api/v1/validate", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    mockValidateLicense.mockResolvedValue(
      Result.ok({
        valid: true,
        message: "Lisensi aktif dan terverifikasi untuk perangkat ini.",
        client_name: "PT Nusantara Digital",
        vault_secret: "SECRET_KEY_ABC",
        expires_at: 1780000000,
      }),
    );

    // Act
    const response = await controller.validate(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.client_name).toBe("PT Nusantara Digital");
    expect(body.vault_secret).toBe("SECRET_KEY_ABC");
  });

  it("should return HTTP 403 when hardware mismatch occurs", async () => {
    // Arrange
    const payload = {
      serial_key: "AKSA-2026-TEST-VALID",
      hwid: "HWID-WRONG-DEVICE",
    };
    const req = new NextRequest("http://localhost:3000/api/v1/validate", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    mockValidateLicense.mockResolvedValue(
      Result.fail({
        statusCode: 403,
        message:
          "Hardware Mismatch: Serial key ini telah terkunci pada perangkat keras (HWID) lain.",
      }),
    );

    // Act
    const response = await controller.validate(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(403);
    expect(body.valid).toBe(false);
    expect(body.message).toContain("Hardware Mismatch");
  });

  it("should return HTTP 404 when license is not found", async () => {
    // Arrange
    const payload = {
      serial_key: "AKSA-NONEXISTENT",
      hwid: "HWID-DEVICE-1",
    };
    const req = new NextRequest("http://localhost:3000/api/v1/validate", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    mockValidateLicense.mockResolvedValue(
      Result.fail({
        statusCode: 404,
        message: "Lisensi Tidak Ditemukan atau Telah Kadaluarsa.",
      }),
    );

    // Act
    const response = await controller.validate(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(body.valid).toBe(false);
    expect(body.message).toContain("Lisensi Tidak Ditemukan");
  });

  it("should return HTTP 400 when validation schema fails (e.g. missing hwid or short key)", async () => {
    // Arrange
    const invalidPayload = {
      serial_key: "SHORT", // min 8 chars
      hwid: "",
    };
    const req = new NextRequest("http://localhost:3000/api/v1/validate", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
      headers: { "Content-Type": "application/json" },
    });

    // Act
    const response = await controller.validate(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(body.valid).toBe(false);
    expect(mockValidateLicense).not.toHaveBeenCalled();
  });
});
