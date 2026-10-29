import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";
import type { LicenseValidationResultType } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";

export class ValidationOutcomeGroupingRule {
  public static mapToSeriesKey(result: LicenseValidationResultType): ValidationTrendSeriesKey {
    switch (result) {
      case "ACTIVATED":
        return "activated";
      case "VERIFIED":
        return "verified";
      case "HWID_MISMATCH":
        return "mismatch";
      default:
        return "rejected";
    }
  }

  public static getSeriesLabel(key: ValidationTrendSeriesKey): string {
    switch (key) {
      case "activated":
        return "Aktivasi Baru";
      case "verified":
        return "Terverifikasi";
      case "mismatch":
        return "Hardware Mismatch";
      case "rejected":
        return "Ditolak";
    }
  }
}
