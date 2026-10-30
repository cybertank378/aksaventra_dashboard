import type { LicenseValidationResult } from "@prisma/client";

export class SuspiciousValidationRule {
  public static isSuspicious(result: LicenseValidationResult, statusCode: number): boolean {
    return result === "HWID_MISMATCH" || statusCode === 403 || result === "SUSPENDED";
  }
}
