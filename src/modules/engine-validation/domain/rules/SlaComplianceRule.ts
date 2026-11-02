import { SLA_TARGET_MS } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

export interface SlaCalculationResult {
  avgLatencyMs: number;
  p95LatencyMs: number;
  compliancePercent: number;
  totalValidSamples: number;
}

export class SlaComplianceRule {
  /**
   * Menghitung metrik SLA latensi:
   * - Rata-rata latensi
   * - P95 (Persentil ke-95)
   * - Persentase sampel dengan latensi < 200ms
   */
  public static calculate(latencies: Array<number | null | undefined>): SlaCalculationResult {
    const validSamples = latencies
      .filter((l): l is number => typeof l === "number" && !Number.isNaN(l) && l >= 0)
      .sort((a, b) => a - b);

    if (validSamples.length === 0) {
      return {
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        compliancePercent: 100,
        totalValidSamples: 0,
      };
    }

    const sum = validSamples.reduce((acc, val) => acc + val, 0);
    const avgLatencyMs = Math.round((sum / validSamples.length) * 10) / 10;

    // Menghitung index P95 (metode nearest rank / standard percentile)
    const p95Index = Math.min(
      validSamples.length - 1,
      Math.floor((validSamples.length * 95) / 100),
    );
    const p95LatencyMs = validSamples[p95Index];

    const compliantCount = validSamples.filter((l) => l < SLA_TARGET_MS).length;
    const compliancePercent = Math.round((compliantCount / validSamples.length) * 1000) / 10; // 1 desimal (contoh: 99.7)

    return {
      avgLatencyMs,
      p95LatencyMs,
      compliancePercent,
      totalValidSamples: validSamples.length,
    };
  }

  public static isBreached(latencyMs: number | null | undefined): boolean {
    if (typeof latencyMs !== "number" || latencyMs < 0) {
      return false;
    }
    return latencyMs >= SLA_TARGET_MS;
  }
}
