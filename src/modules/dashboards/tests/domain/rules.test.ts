import { describe, expect, it } from "vitest";
import { GrowthRateRule } from "@/modules/dashboards/domain/rules/GrowthRateRule";
import { LicenseExpiryRule } from "@/modules/dashboards/domain/rules/LicenseExpiryRule";
import { TimeSeriesBucketRule } from "@/modules/dashboards/domain/rules/TimeSeriesBucketRule";
import { ValidationOutcomeGroupingRule } from "@/modules/dashboards/domain/rules/ValidationOutcomeGroupingRule";

describe("Dashboard Domain Rules (Triple A Pattern)", () => {
  describe("LicenseExpiryRule", () => {
    const fixedNow = new Date("2026-10-29T10:00:00Z");

    it("should evaluate null or undefined expiresAt as ACTIVE (lifetime license)", () => {
      // Arrange & Act
      const state1 = LicenseExpiryRule.evaluate("ACTIVE", null, fixedNow);
      const state2 = LicenseExpiryRule.evaluate("ACTIVE", undefined, fixedNow);

      // Assert
      expect(state1).toBe("ACTIVE");
      expect(state2).toBe("ACTIVE");
    });

    it("should evaluate license expiring in +5 days as EXPIRING_SOON", () => {
      // Arrange
      const in5Days = new Date(fixedNow.getTime() + 5 * 24 * 60 * 60 * 1000);

      // Act
      const state = LicenseExpiryRule.evaluate("ACTIVE", in5Days, fixedNow);

      // Assert
      expect(state).toBe("EXPIRING_SOON");
    });

    it("should evaluate license expiring exactly in +30 days as EXPIRING_SOON", () => {
      // Arrange
      const in30Days = new Date(fixedNow.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Act
      const state = LicenseExpiryRule.evaluate("ACTIVE", in30Days, fixedNow);

      // Assert
      expect(state).toBe("EXPIRING_SOON");
    });

    it("should evaluate license expiring in +31 days as ACTIVE", () => {
      // Arrange
      const in31Days = new Date(fixedNow.getTime() + 31 * 24 * 60 * 60 * 1000);

      // Act
      const state = LicenseExpiryRule.evaluate("ACTIVE", in31Days, fixedNow);

      // Assert
      expect(state).toBe("ACTIVE");
    });

    it("should evaluate license expiring yesterday as EXPIRED", () => {
      // Arrange
      const yesterday = new Date(fixedNow.getTime() - 24 * 60 * 60 * 1000);

      // Act
      const state = LicenseExpiryRule.evaluate("ACTIVE", yesterday, fixedNow);

      // Assert
      expect(state).toBe("EXPIRED");
    });

    it("should respect SUSPENDED status unconditionally", () => {
      // Arrange
      const in10Days = new Date(fixedNow.getTime() + 10 * 24 * 60 * 60 * 1000);

      // Act
      const state = LicenseExpiryRule.evaluate("SUSPENDED", in10Days, fixedNow);

      // Assert
      expect(state).toBe("SUSPENDED");
    });
  });

  describe("GrowthRateRule", () => {
    it("should calculate positive growth rate accurately (110 from 100 -> +10.0%)", () => {
      // Act
      const rate = GrowthRateRule.calculate(110, 100);

      // Assert
      expect(rate).toBe(10.0);
    });

    it("should calculate negative growth rate accurately (90 from 100 -> -10.0%)", () => {
      // Act
      const rate = GrowthRateRule.calculate(90, 100);

      // Assert
      expect(rate).toBe(-10.0);
    });

    it("should safely handle zero previous count (5 from 0)", () => {
      // Act
      const rate = GrowthRateRule.calculate(5, 0);

      // Assert
      expect(rate).toBe(500.0);
    });

    it("should return 0 when both current and previous counts are zero", () => {
      // Act
      const rate = GrowthRateRule.calculate(0, 0);

      // Assert
      expect(rate).toBe(0);
    });
  });

  describe("ValidationOutcomeGroupingRule", () => {
    it("should map failure outcomes to rejected", () => {
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("NOT_FOUND")).toBe("rejected");
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("EXPIRED")).toBe("rejected");
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("SUSPENDED")).toBe("rejected");
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("BAD_REQUEST")).toBe("rejected");
    });

    it("should map valid and mismatch outcomes accurately", () => {
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("ACTIVATED")).toBe("activated");
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("VERIFIED")).toBe("verified");
      expect(ValidationOutcomeGroupingRule.mapToSeriesKey("HWID_MISMATCH")).toBe("mismatch");
    });
  });

  describe("TimeSeriesBucketRule", () => {
    it("should fill missing days with 0 across a 7-day range with data only on 2 days", () => {
      // Arrange: 7-day range from 2026-10-23 to 2026-10-29
      const start = new Date("2026-10-23T00:00:00Z");
      const end = new Date("2026-10-29T00:00:00Z");
      const records = [
        { bucket: "2026-10-24", value: 42 },
        { bucket: "2026-10-28", value: 18 },
      ];

      // Act
      const points = TimeSeriesBucketRule.fillBuckets(start, end, "day", records, "UTC");

      // Assert: Exactly 7 points
      expect(points).toHaveLength(7);
      expect(points[0].bucket).toBe("2026-10-23");
      expect(points[0].value).toBe(0);

      expect(points[1].bucket).toBe("2026-10-24");
      expect(points[1].value).toBe(42);

      expect(points[5].bucket).toBe("2026-10-28");
      expect(points[5].value).toBe(18);

      expect(points[6].bucket).toBe("2026-10-29");
      expect(points[6].value).toBe(0);
    });
  });
});
