import { describe, expect, it } from "vitest";
import { SlaComplianceRule } from "@/modules/engine-validation/domain/rules/SlaComplianceRule";

describe("SlaComplianceRule (Triple A Pattern)", () => {
  it("should calculate correct average, P95, and compliance percentage for normal distribution", () => {
    // Arrange
    const latencies = [
      20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 150, 180, 250,
    ];

    // Act
    const result = SlaComplianceRule.calculate(latencies);

    // Assert
    // 20 sampel, 1 yang >= 200 (yaitu 250), 19 yang < 200 -> 19/20 = 95%
    expect(result.totalValidSamples).toBe(20);
    expect(result.compliancePercent).toBe(95);
    expect(result.p95LatencyMs).toBe(250);
    expect(result.avgLatencyMs).toBeGreaterThan(0);
  });

  it("should handle empty or invalid latencies gracefully", () => {
    // Arrange
    const latencies = [null, undefined, Number.NaN, -5];

    // Act
    const result = SlaComplianceRule.calculate(latencies);

    // Assert
    expect(result.totalValidSamples).toBe(0);
    expect(result.avgLatencyMs).toBe(0);
    expect(result.p95LatencyMs).toBe(0);
    expect(result.compliancePercent).toBe(100);
  });

  it("should accurately flag SLA breach when latency exceeds 200ms", () => {
    // Arrange & Act & Assert
    expect(SlaComplianceRule.isBreached(199)).toBe(false);
    expect(SlaComplianceRule.isBreached(200)).toBe(true);
    expect(SlaComplianceRule.isBreached(450)).toBe(true);
    expect(SlaComplianceRule.isBreached(null)).toBe(false);
  });
});
