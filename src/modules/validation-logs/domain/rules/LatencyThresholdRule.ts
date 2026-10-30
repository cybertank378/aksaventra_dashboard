export type LatencyCategory = "OPTIMAL" | "ACCEPTABLE" | "BREACHED";

export class LatencyThresholdRule {
  public static evaluate(latencyMs: number | null | undefined): LatencyCategory {
    if (latencyMs === null || latencyMs === undefined) {
      return "OPTIMAL";
    }
    if (latencyMs < 100) {
      return "OPTIMAL";
    }
    if (latencyMs < 200) {
      return "ACCEPTABLE";
    }
    return "BREACHED";
  }

  public static isSlaBreached(latencyMs: number | null | undefined): boolean {
    return LatencyThresholdRule.evaluate(latencyMs) === "BREACHED";
  }
}
