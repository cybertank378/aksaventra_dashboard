import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import type { SystemSettingsServices } from "../../application/services/SystemSettingsServices";
import { SystemSettingsController } from "../../infrastructure/http/SystemSettingsController";
import { DEFAULT_SYSTEM_SETTINGS } from "../../shared/constants/defaultSystemSettings";
import { createMockSystemDiagnostics } from "../mocks/mockSystemSettingsFactories";

vi.mock("@/modules/auth/infrastructure/decorator/getCurrentAuth", () => ({
  getCurrentAuth: vi.fn().mockResolvedValue({
    userId: "test-admin-id",
    role: "ADMIN",
  }),
}));

describe("SystemSettingsController", () => {
  let mockServices: SystemSettingsServices;
  let controller: SystemSettingsController;

  const mockPayload = {
    ...DEFAULT_SYSTEM_SETTINGS,
    diagnostics: createMockSystemDiagnostics(),
    lastUpdatedAt: "2026-10-30T08:15:00.000Z",
    lastUpdatedByName: "Admin",
  };

  beforeEach(() => {
    mockServices = {
      getSettings: vi.fn().mockResolvedValue(Result.ok(mockPayload)),
      updateSettings: vi.fn().mockResolvedValue(Result.ok(mockPayload)),
      resetCategory: vi.fn().mockResolvedValue(Result.ok(mockPayload)),
      purgeExpiredLogs: vi.fn().mockResolvedValue(
        Result.ok({
          purgedValidationLogsCount: 15,
          purgedUpdateLogsCount: 5,
          totalPurgedCount: 20,
          purgedBeforeDate: new Date().toISOString(),
        }),
      ),
    } as unknown as SystemSettingsServices;

    controller = new SystemSettingsController(mockServices);
  });

  it("should return 200 on getSettings", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/settings");

    // Act
    const res = await controller.getSettings(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.licenseEngine.expiringSoonThresholdDays).toBe(30);
  });

  it("should return 200 on updateSettings with valid body", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: "LICENSE_ENGINE",
        licenseEngine: {
          expiringSoonThresholdDays: 25,
        },
      }),
    });

    // Act
    const res = await controller.updateSettings(req);

    // Assert
    expect(res.status).toBe(200);
    expect(mockServices.updateSettings).toHaveBeenCalled();
  });

  it("should return 400 on updateSettings with invalid body", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: "UNKNOWN_CATEGORY",
      }),
    });

    // Act
    const res = await controller.updateSettings(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(400);
    expect(json.errors[0]).toContain("Kategori pengaturan tidak valid");
  });

  it("should return 200 on resetCategory", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/settings/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        category: "SECURITY_AUTH",
      }),
    });

    // Act
    const res = await controller.resetCategory(req);

    // Assert
    expect(res.status).toBe(200);
    expect(mockServices.resetCategory).toHaveBeenCalled();
  });

  it("should return 200 on purgeExpiredLogs", async () => {
    // Arrange
    const req = new NextRequest("http://localhost:3000/api/v1/settings/maintenance/purge-logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target: "ALL",
        confirm: true,
      }),
    });

    // Act
    const res = await controller.purgeExpiredLogs(req);
    const json = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(json.totalPurgedCount).toBe(20);
    expect(mockServices.purgeExpiredLogs).toHaveBeenCalled();
  });
});
