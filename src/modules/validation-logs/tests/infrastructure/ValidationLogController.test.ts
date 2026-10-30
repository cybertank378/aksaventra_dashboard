import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import type { ValidationLogServices } from "../../application/services/ValidationLogServices";
import { ValidationLogController } from "../../infrastructure/http/ValidationLogController";

describe("ValidationLogController (Triple A Pattern)", () => {
  let mockListLogs: ReturnType<typeof vi.fn>;
  let mockGetStats: ReturnType<typeof vi.fn>;
  let mockGetDetail: ReturnType<typeof vi.fn>;
  let mockExportLogs: ReturnType<typeof vi.fn>;
  let controller: ValidationLogController;

  beforeEach(() => {
    mockListLogs = vi.fn();
    mockGetStats = vi.fn();
    mockGetDetail = vi.fn();
    mockExportLogs = vi.fn();

    const mockServices = {
      listLogs: mockListLogs,
      getStats: mockGetStats,
      getDetail: mockGetDetail,
      exportLogs: mockExportLogs,
    } as unknown as ValidationLogServices;

    controller = new ValidationLogController(mockServices);
  });

  describe("GET /api/v1/logs/validations", () => {
    it("should return HTTP 200 with list data on valid query", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/logs/validations?page=1&limit=15");
      mockListLogs.mockResolvedValue(
        Result.ok({
          logs: [],
          pagination: { total: 0, page: 1, limit: 15, totalPages: 1 },
        }),
      );

      // Act
      const res = await controller.list(req);

      // Assert
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.pagination.total).toBe(0);
    });

    it("should return HTTP 400 when query parameter is invalid", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/logs/validations?page=-5");

      // Act
      const res = await controller.list(req);

      // Assert
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.errors.page).toBeDefined();
    });
  });

  describe("GET /api/v1/logs/validations/stats", () => {
    it("should return HTTP 200 with stats data", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/logs/validations/stats");
      mockGetStats.mockResolvedValue(
        Result.ok({
          totalRequests24h: 100,
          verifiedCount24h: 98,
          successRatePercent: 98.0,
          hwidMismatchCount24h: 1,
          rejectedCount24h: 1,
          avgLatencyMs: 25,
        }),
      );

      // Act
      const res = await controller.getStats(req);

      // Assert
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.totalRequests24h).toBe(100);
    });
  });

  describe("GET /api/v1/logs/validations/[id]", () => {
    it("should return HTTP 200 with detail when found", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/logs/validations/log-123");
      mockGetDetail.mockResolvedValue(
        Result.ok({
          log: { id: "log-123" },
          license: null,
        }),
      );

      // Act
      const res = await controller.getDetail(req, Promise.resolve({ id: "log-123" }));

      // Assert
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.log.id).toBe("log-123");
    });

    it("should return HTTP 404 when log is not found", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/logs/validations/non-existent");
      mockGetDetail.mockResolvedValue(Result.fail("Log validasi tidak ditemukan"));

      // Act
      const res = await controller.getDetail(req, Promise.resolve({ id: "non-existent" }));

      // Assert
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/v1/logs/validations/export", () => {
    it("should return downloadable CSV buffer with appropriate headers", async () => {
      // Arrange
      const req = new NextRequest("http://localhost:3000/api/v1/logs/validations/export");
      mockExportLogs.mockResolvedValue(
        Result.ok({
          buffer: Buffer.from("csv,header\r\n1,2"),
          filename: "test.csv",
          contentType: "text/csv; charset=utf-8",
        }),
      );

      // Act
      const res = await controller.export(req);

      // Assert
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
      expect(res.headers.get("Content-Disposition")).toContain("test.csv");
    });
  });
});
