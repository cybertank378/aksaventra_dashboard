import { describe, expect, it } from "vitest";
import { DashboardValidator } from "@/modules/dashboards/infrastructure/validators/dashboard.validator";

describe("DashboardValidator (Triple A Pattern)", () => {
  describe("validateChartRange", () => {
    it("should accept valid ranges: 7d, 30d, 90d", () => {
      expect(DashboardValidator.validateChartRange({ range: "7d" }).isValid).toBe(true);
      expect(DashboardValidator.validateChartRange({ range: "30d" }).isValid).toBe(true);
      expect(DashboardValidator.validateChartRange({ range: "90d" }).isValid).toBe(true);
    });

    it("should default to 30d when range is empty or undefined", () => {
      const res1 = DashboardValidator.validateChartRange({});
      expect(res1.isValid).toBe(true);
      expect(res1.data?.range).toBe("30d");

      const res2 = DashboardValidator.validateChartRange(null);
      expect(res2.isValid).toBe(true);
      expect(res2.data?.range).toBe("30d");
    });

    it("should reject invalid range", () => {
      const res = DashboardValidator.validateChartRange({ range: "1y" });
      expect(res.isValid).toBe(false);
      expect(res.errors.range).toContain("Parameter range harus salah satu dari");
    });
  });

  describe("validateRecentLicenses", () => {
    it("should default to ALL status, page 1, limit 5", () => {
      const res = DashboardValidator.validateRecentLicenses({});
      expect(res.isValid).toBe(true);
      expect(res.data?.status).toBe("ALL");
      expect(res.data?.page).toBe(1);
      expect(res.data?.limit).toBe(5);
    });

    it("should accept valid statuses", () => {
      expect(DashboardValidator.validateRecentLicenses({ status: "ACTIVE" }).isValid).toBe(true);
      expect(DashboardValidator.validateRecentLicenses({ status: "EXPIRING_SOON" }).isValid).toBe(
        true,
      );
      expect(DashboardValidator.validateRecentLicenses({ status: "EXPIRED" }).isValid).toBe(true);
      expect(DashboardValidator.validateRecentLicenses({ status: "SUSPENDED" }).isValid).toBe(true);
    });

    it("should reject invalid status", () => {
      const res = DashboardValidator.validateRecentLicenses({ status: "DELETED" });
      expect(res.isValid).toBe(false);
      expect(res.errors.status).toContain("Parameter status tidak valid");
    });

    it("should reject limit exceeding 50", () => {
      const res = DashboardValidator.validateRecentLicenses({ limit: "100" });
      expect(res.isValid).toBe(false);
      expect(res.errors.limit).toContain("tidak boleh melebihi 50");
    });
  });

  describe("validateActivities", () => {
    it("should default to limit 6", () => {
      const res = DashboardValidator.validateActivities({});
      expect(res.isValid).toBe(true);
      expect(res.data?.limit).toBe(6);
    });

    it("should reject limit exceeding 20", () => {
      const res = DashboardValidator.validateActivities({ limit: 50 });
      expect(res.isValid).toBe(false);
      expect(res.errors.limit).toContain("tidak boleh melebihi 20");
    });
  });
});
