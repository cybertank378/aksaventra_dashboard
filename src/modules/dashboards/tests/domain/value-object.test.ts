import { describe, expect, it } from "vitest";
import { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";
import { ExpiryWindow } from "@/modules/dashboards/domain/value-object/ExpiryWindow";
import { TimeSeriesPoint } from "@/modules/dashboards/domain/value-object/TimeSeriesPoint";
import { UtilizationRate } from "@/modules/dashboards/domain/value-object/UtilizationRate";

describe("Dashboard Value Objects (Triple A Pattern)", () => {
  describe("UtilizationRate", () => {
    it("should return 0 when totalActive is 0", () => {
      // Act
      const rate = new UtilizationRate(0, 0);

      // Assert
      expect(rate.value).toBe(0);
      expect(rate.toFormattedString()).toBe("0.0%");
    });

    it("should calculate 87.5% accurately for 7 bound out of 8 active", () => {
      // Act
      const rate = new UtilizationRate(7, 8);

      // Assert
      expect(rate.value).toBe(87.5);
      expect(rate.toFormattedString()).toBe("87.5%");
    });

    it("should throw error for negative counts", () => {
      // Act & Assert
      expect(() => new UtilizationRate(-1, 10)).toThrow("Active count cannot be negative");
      expect(() => new UtilizationRate(5, -2)).toThrow("Active count cannot be negative");
    });
  });

  describe("DateRange", () => {
    it("should reject when startDate is greater than or equal to endDate", () => {
      const now = new Date("2026-10-29T10:00:00Z");
      const past = new Date("2026-10-28T10:00:00Z");

      expect(() => new DateRange(now, past)).toThrow("Start date must be strictly before end date");
      expect(() => new DateRange(now, now)).toThrow("Start date must be strictly before end date");
    });

    it("should create valid range from ChartRange 7d, 30d, and 90d", () => {
      const now = new Date("2026-10-29T10:00:00Z");
      const range7d = DateRange.fromChartRange("7d", now);
      const range30d = DateRange.fromChartRange("30d", now);
      const range90d = DateRange.fromChartRange("90d", now);

      expect(range7d.durationDays).toBe(7);
      expect(range30d.durationDays).toBe(30);
      expect(range90d.durationDays).toBe(90);
    });
  });

  describe("TimeSeriesPoint", () => {
    it("should reject negative values", () => {
      expect(
        () => new TimeSeriesPoint({ bucket: "2026-10-29", label: "29 Okt", value: -5 }),
      ).toThrow("TimeSeriesPoint value must be non-negative");
    });

    it("should instantiate with non-negative values", () => {
      const pt = new TimeSeriesPoint({ bucket: "2026-10-29", label: "29 Okt", value: 120 });
      expect(pt.value).toBe(120);
      expect(pt.bucket).toBe("2026-10-29");
      expect(pt.label).toBe("29 Okt");
    });
  });

  describe("ExpiryWindow", () => {
    it("should default to 30 days window from now", () => {
      const now = new Date("2026-10-29T10:00:00Z");
      const window = new ExpiryWindow(now);

      expect(window.days).toBe(30);
      const expectedEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(window.endDate.getTime()).toBe(expectedEnd.getTime());
    });

    it("should reject negative days", () => {
      const now = new Date("2026-10-29T10:00:00Z");
      expect(() => new ExpiryWindow(now, -10)).toThrow("ExpiryWindow days cannot be negative");
    });
  });
});
