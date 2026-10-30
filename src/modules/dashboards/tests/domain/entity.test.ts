import { describe, expect, it } from "vitest";
import { DashboardSummaryEntity } from "@/modules/dashboards/domain/entity/DashboardSummaryEntity";
import { ValidationTrendEntity } from "@/modules/dashboards/domain/entity/ValidationTrendEntity";
import { TimeSeriesPoint } from "@/modules/dashboards/domain/value-object/TimeSeriesPoint";

describe("Dashboard Entities (Triple A Pattern)", () => {
  describe("DashboardSummaryEntity", () => {
    it("should accurately report renewal warnings, growth rate, and utilization", () => {
      // Arrange
      const now = new Date("2026-10-29T10:00:00Z");
      const entity = new DashboardSummaryEntity({
        activeLicensesCount: 20,
        previousActiveLicensesCount: 15,
        expiringLicensesCount: 2,
        expiredOrRevokedCount: 3,
        activeWithHwidCount: 18,
        renewalWarnings: [
          {
            id: "warn-1",
            clientName: "PT Nusantara",
            serialKey: "AKSA-2026-NUSA-1234",
            expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          },
        ],
        now,
      });

      // Assert
      expect(entity.hasRenewalWarning()).toBe(true);
      expect(entity.getGrowthRate()).toBe(33.3);
      expect(entity.getUtilizationRate().value).toBe(90.0);

      const dto = entity.toDTO();
      expect(dto.kpis.activeLicenses.total).toBe(20);
      expect(dto.kpis.hwidUtilization.rate).toBe(90.0);
      expect(dto.renewalWarnings).toHaveLength(1);
      expect(dto.renewalWarnings[0].serialKeyMasked).toBe("AKSA-••••-••••-1234");
      expect(dto.renewalWarnings[0].daysRemaining).toBe(5);
    });

    it("should report hasRenewalWarning as false when list is empty", () => {
      const now = new Date("2026-10-29T10:00:00Z");
      const entity = new DashboardSummaryEntity({
        activeLicensesCount: 0,
        previousActiveLicensesCount: 0,
        expiringLicensesCount: 0,
        expiredOrRevokedCount: 0,
        activeWithHwidCount: 0,
        renewalWarnings: [],
        now,
      });

      expect(entity.hasRenewalWarning()).toBe(false);
      expect(entity.getGrowthRate()).toBe(0);
      expect(entity.getUtilizationRate().value).toBe(0);
    });
  });

  describe("ValidationTrendEntity", () => {
    it("should return successRate 0 when total is 0", () => {
      const entity = new ValidationTrendEntity({
        range: "7d",
        granularity: "day",
        timezone: "Asia/Jakarta",
        series: [
          { key: "activated", label: "Aktivasi Baru", points: [] },
          { key: "verified", label: "Terverifikasi", points: [] },
          { key: "rejected", label: "Ditolak", points: [] },
          { key: "mismatch", label: "Hardware Mismatch", points: [] },
        ],
      });

      expect(entity.getTotalCount()).toBe(0);
      expect(entity.getSuccessRate()).toBe(0);
    });

    it("should calculate successRate accurately when data is present", () => {
      const pt1 = new TimeSeriesPoint({ bucket: "2026-10-29", label: "29 Okt", value: 10 });
      const pt2 = new TimeSeriesPoint({ bucket: "2026-10-29", label: "29 Okt", value: 90 });
      const pt3 = new TimeSeriesPoint({ bucket: "2026-10-29", label: "29 Okt", value: 10 });
      const pt4 = new TimeSeriesPoint({ bucket: "2026-10-29", label: "29 Okt", value: 10 });

      const entity = new ValidationTrendEntity({
        range: "30d",
        granularity: "day",
        timezone: "Asia/Jakarta",
        series: [
          { key: "activated", label: "Aktivasi Baru", points: [pt1] },
          { key: "verified", label: "Terverifikasi", points: [pt2] },
          { key: "rejected", label: "Ditolak", points: [pt3] },
          { key: "mismatch", label: "Hardware Mismatch", points: [pt4] },
        ],
      });

      // total = 10 + 90 + 10 + 10 = 120
      // successful = 10 + 90 = 100
      // rate = 100 / 120 * 100 = 83.3%
      expect(entity.getTotalCount()).toBe(120);
      expect(entity.getSuccessRate()).toBe(83.3);
    });
  });
});
