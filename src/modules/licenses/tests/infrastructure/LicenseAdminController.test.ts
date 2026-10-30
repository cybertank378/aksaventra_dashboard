import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import type { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseAdminController } from "@/modules/licenses/infrastructure/http/LicenseAdminController";

vi.mock("@/modules/auth/infrastructure/decorator/getCurrentAuth", () => ({
  getCurrentAuth: vi.fn().mockResolvedValue({
    userId: "admin-1",
    role: "ADMIN",
  }),
}));

describe("LicenseAdminController (Triple A Pattern)", () => {
  let mockServices: {
    listLicenses: ReturnType<typeof vi.fn>;
    getStats: ReturnType<typeof vi.fn>;
    getLicenseDetail: ReturnType<typeof vi.fn>;
    createLicense: ReturnType<typeof vi.fn>;
    resetDeviceHwid: ReturnType<typeof vi.fn>;
    updateLicenseStatus: ReturnType<typeof vi.fn>;
  };
  let controller: LicenseAdminController;

  beforeEach(() => {
    mockServices = {
      listLicenses: vi.fn(),
      getStats: vi.fn(),
      getLicenseDetail: vi.fn(),
      createLicense: vi.fn(),
      resetDeviceHwid: vi.fn(),
      updateLicenseStatus: vi.fn(),
    };

    controller = new LicenseAdminController(mockServices as unknown as LicenseServices);
  });

  it("should return HTTP 200 on list() with mapped licenses", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/licenses?page=1&limit=10");
    mockServices.listLicenses.mockResolvedValue(
      Result.ok({
        licenses: [
          {
            id: "lic-1",
            clientName: "PT Global",
            serialKey: "AKSA-PRO-2026-AAAA",
            serialKeyMasked: "AKSA-••••-••••-AAAA",
            status: "ACTIVE",
            isBound: false,
          },
        ],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      }),
    );

    // Act
    const response = await controller.list(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.licenses).toHaveLength(1);
    expect(body.licenses[0].clientName).toBe("PT Global");
  });

  it("should return HTTP 200 on getStats()", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/licenses/stats");
    mockServices.getStats.mockResolvedValue(
      Result.ok({
        totalLicenses: 10,
        activeLicenses: 8,
        expiringSoonLicenses: 2,
        expiredOrSuspendedLicenses: 2,
        boundDevicesCount: 5,
        unboundActiveCount: 3,
        verifiedLast24hCount: 20,
        hwidMismatchLast24hCount: 1,
      }),
    );

    // Act
    const response = await controller.getStats(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.totalLicenses).toBe(10);
    expect(body.boundDevicesCount).toBe(5);
  });

  it("should return HTTP 201 on create()", async () => {
    // Arrange
    const payload = {
      clientName: "CV Maju Jaya",
      tier: "PRO",
      durationMonths: 12,
    };
    const req = new NextRequest("http://localhost:3000/api/v1/licenses", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    mockServices.createLicense.mockResolvedValue(
      Result.ok({
        id: "lic-created",
        clientName: "CV Maju Jaya",
        serialKey: "AKSA-PRO-2026-MJ01",
        status: "ACTIVE",
        isBound: false,
      }),
    );

    // Act
    const response = await controller.create(req);
    const body = await response.json();

    // Assert
    expect(response.status).toBe(201);
    expect(body.id).toBe("lic-created");
    expect(body.clientName).toBe("CV Maju Jaya");
  });

  it("should return HTTP 200 on resetHwid()", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/licenses/lic-123/reset-hwid", {
      method: "PATCH",
      body: JSON.stringify({ reason: "Ganti PC Baru" }),
    });

    mockServices.resetDeviceHwid.mockResolvedValue(
      Result.ok({
        id: "lic-123",
        hwid: null,
        isBound: false,
      }),
    );

    // Act
    const response = await controller.resetHwid(req, {
      params: Promise.resolve({ id: "lic-123" }),
    });
    const body = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.license.hwid).toBeNull();
  });
});

