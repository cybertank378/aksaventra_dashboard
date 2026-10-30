import { describe, expect, it } from "vitest";
import { LatencyThresholdRule } from "../../domain/rules/LatencyThresholdRule";
import { SuspiciousValidationRule } from "../../domain/rules/SuspiciousValidationRule";

describe("Validation Log Domain Rules (Triple A Pattern)", () => {
  describe("LatencyThresholdRule", () => {
    it("should classify latency < 100ms as OPTIMAL and not breached", () => {
      // Arrange & Act
      const catNull = LatencyThresholdRule.evaluate(null);
      const catOptimal = LatencyThresholdRule.evaluate(45);
      const isBreached = LatencyThresholdRule.isSlaBreached(45);

      // Assert
      expect(catNull).toBe("OPTIMAL");
      expect(catOptimal).toBe("OPTIMAL");
      expect(isBreached).toBe(false);
    });

    it("should classify 100ms <= latency < 200ms as ACCEPTABLE and not breached", () => {
      // Arrange & Act
      const cat = LatencyThresholdRule.evaluate(150);
      const isBreached = LatencyThresholdRule.isSlaBreached(150);

      // Assert
      expect(cat).toBe("ACCEPTABLE");
      expect(isBreached).toBe(false);
    });

    it("should classify latency >= 200ms as BREACHED", () => {
      // Arrange & Act
      const cat200 = LatencyThresholdRule.evaluate(200);
      const cat500 = LatencyThresholdRule.evaluate(500);
      const isBreached = LatencyThresholdRule.isSlaBreached(200);

      // Assert
      expect(cat200).toBe("BREACHED");
      expect(cat500).toBe("BREACHED");
      expect(isBreached).toBe(true);
    });
  });

  describe("SuspiciousValidationRule", () => {
    it("should flag HWID_MISMATCH as suspicious", () => {
      // Arrange & Act
      const result = SuspiciousValidationRule.isSuspicious("HWID_MISMATCH", 403);

      // Assert
      expect(result).toBe(true);
    });

    it("should flag status 403 as suspicious", () => {
      // Arrange & Act
      const result = SuspiciousValidationRule.isSuspicious("BAD_REQUEST", 403);

      // Assert
      expect(result).toBe(true);
    });

    it("should flag SUSPENDED as suspicious", () => {
      // Arrange & Act
      const result = SuspiciousValidationRule.isSuspicious("SUSPENDED", 401);

      // Assert
      expect(result).toBe(true);
    });

    it("should not flag normal VERIFIED or ACTIVATED 200 requests", () => {
      // Arrange & Act
      const verified = SuspiciousValidationRule.isSuspicious("VERIFIED", 200);
      const activated = SuspiciousValidationRule.isSuspicious("ACTIVATED", 200);

      // Assert
      expect(verified).toBe(false);
      expect(activated).toBe(false);
    });
  });
});
