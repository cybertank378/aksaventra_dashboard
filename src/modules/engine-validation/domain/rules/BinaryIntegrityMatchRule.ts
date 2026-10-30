import type { RawReleaseRecord } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";
import type { BinaryIntegrityOutcome } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

export interface IntegrityEvaluationResult {
  outcome: BinaryIntegrityOutcome;
  isTrusted: boolean;
  expectedHash: string | null;
  releaseId?: string | null;
  channel?: string | null;
}

export class BinaryIntegrityMatchRule {
  /**
   * Mengevaluasi kecocokan hash SHA-256 binary engine terhadap registry resmi (#39)
   */
  public static evaluate(
    providedHash: string,
    releaseRecord: RawReleaseRecord | null,
  ): IntegrityEvaluationResult {
    if (!releaseRecord) {
      return {
        outcome: "UNKNOWN_VERSION",
        isTrusted: false,
        expectedHash: null,
      };
    }

    const normalizedProvided = providedHash.trim().toLowerCase();
    const normalizedExpected = releaseRecord.checksumSha256.trim().toLowerCase();

    if (normalizedProvided !== normalizedExpected) {
      return {
        outcome: "HASH_MISMATCH",
        isTrusted: false,
        expectedHash: releaseRecord.checksumSha256,
        releaseId: releaseRecord.id,
        channel: releaseRecord.channel,
      };
    }

    if (!releaseRecord.isActive) {
      return {
        outcome: "REVOKED",
        isTrusted: false,
        expectedHash: releaseRecord.checksumSha256,
        releaseId: releaseRecord.id,
        channel: releaseRecord.channel,
      };
    }

    return {
      outcome: "VALID",
      isTrusted: true,
      expectedHash: releaseRecord.checksumSha256,
      releaseId: releaseRecord.id,
      channel: releaseRecord.channel,
    };
  }
}
