import type {
  BinaryIntegrityItemDTO,
  LiveFeedItemDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type {
  RawReleaseRecord,
  RawValidationLogRecord,
} from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";
import { SlaComplianceRule } from "@/modules/engine-validation/domain/rules/SlaComplianceRule";

export class EngineMonitorMapper {
  public static maskSerialKey(serialKeyOrHint: string): string {
    const clean = serialKeyOrHint.trim();
    if (clean.length <= 4) {
      return `AKSA-••••-${clean}`;
    }

    const lastFour = clean.slice(-4).toUpperCase();
    return `AKSA-••••-••••-${lastFour}`;
  }

  public static toLiveFeedItemDTO(log: RawValidationLogRecord): LiveFeedItemDTO {
    const rawKey = log.license?.serialKey || log.serialKeyHint;
    const clientName = log.license?.clientName || "Tidak Diketahui";

    return {
      id: log.id,
      licenseId: log.licenseId,
      clientName,
      serialKeyMasked: EngineMonitorMapper.maskSerialKey(rawKey),
      serialKeyHint: log.serialKeyHint,
      hwidHash: log.hwidHash,
      result: log.result,
      statusCode: log.statusCode,
      engineVersion: log.engineVersion,
      clientIp: log.clientIp,
      latencyMs: log.latencyMs,
      isSlaBreached: SlaComplianceRule.isBreached(log.latencyMs),
      checkedAt: log.checkedAt.toISOString(),
    };
  }

  public static toBinaryIntegrityDTO(release: RawReleaseRecord): BinaryIntegrityItemDTO {
    return {
      id: release.id,
      version: release.version,
      channel: release.channel,
      checksumSha256: release.checksumSha256,
      fileSize: release.fileSize,
      isActive: release.isActive,
      downloadCount: release.downloadCount,
      publishedAt: release.publishedAt.toISOString(),
      createdAt: release.createdAt.toISOString(),
      updatedAt: release.updatedAt.toISOString(),
    };
  }
}
