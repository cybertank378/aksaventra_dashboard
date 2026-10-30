import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import type { ReleaseServices } from "@/modules/releases/application/services/ReleaseServices";
import { UpdaterController } from "@/modules/releases/infrastructure/http/UpdaterController";

describe("UpdaterController (Triple A Pattern)", () => {
  let mockCheckVersion: ReturnType<typeof vi.fn>;
  let mockGetLatestRelease: ReturnType<typeof vi.fn>;
  let mockRecordDownload: ReturnType<typeof vi.fn>;
  let controller: UpdaterController;

  beforeEach(() => {
    mockCheckVersion = vi.fn();
    mockGetLatestRelease = vi.fn();
    mockRecordDownload = vi.fn().mockResolvedValue(Result.ok(true));

    const mockServices = {
      checkVersion: mockCheckVersion,
      getLatestRelease: mockGetLatestRelease,
      recordDownload: mockRecordDownload,
    } as unknown as ReleaseServices;

    controller = new UpdaterController(mockServices);
  });

  describe("POST /api/v1/updater/version", () => {
    it("should return HTTP 200 with update payload when newer version is found", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/v1/updater/version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_version: "v2.2.1",
          hwid: "1caee749-5928-4c89-a052-ca4f27af8c41",
          serial_key: "AKSA-ENTERPRISE-2026-9F2A",
          channel: "stable",
        }),
      });

      mockCheckVersion.mockResolvedValue(
        Result.ok({
          status: "success",
          has_update: true,
          latest_version: "v2.2.2",
          min_supported_version: "v2.0.0",
          mandatory: false,
          download_url: "https://aksaventra.ai.id/api/v1/updater/download/aksaventra_engine.exe",
          checksum_sha256: "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
          release_notes: "Pembaruan penanganan lisensi otomatis.",
          published_at: 1824792000,
        }),
      );

      // Act
      const response = await controller.checkVersion(request);
      const json = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(json.status).toBe("success");
      expect(json.has_update).toBe(true);
      expect(json.latest_version).toBe("v2.2.2");
      expect(json.checksum_sha256).toBe(
        "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      );
    });

    it("should return HTTP 400 when client_version is omitted", async () => {
      // Arrange
      const request = new NextRequest("http://localhost:3000/api/v1/updater/version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hwid: "1caee749-5928-4c89-a052-ca4f27af8c41",
        }),
      });

      // Act
      const response = await controller.checkVersion(request);
      const json = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(json.status).toBe("error");
    });
  });

  describe("GET /api/v1/updater/version (Query params)", () => {
    it("should parse query params and return status 200", async () => {
      // Arrange
      const request = new NextRequest(
        "http://localhost:3000/api/v1/updater/version?client_version=v2.2.1&channel=stable",
        {
          method: "GET",
        },
      );

      mockCheckVersion.mockResolvedValue(
        Result.ok({
          status: "success",
          has_update: false,
          latest_version: "v2.2.1",
          message: "Anda menggunakan versi terbaru.",
        }),
      );

      // Act
      const response = await controller.checkVersion(request);
      const json = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(json.has_update).toBe(false);
    });
  });
});
