import type {
  License as PrismaLicense,
  LicenseStatus as PrismaLicenseStatus,
} from "@prisma/client";
import type { UserRole } from "@/libs/enums";
import type {
  LicenseAdminItemDTO,
  LicenseDetailResponseDTO,
  LicenseRecentValidationLogDTO,
  LicenseStatsResponseDTO,
} from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import { LicenseEntity, type LicenseStatus } from "@/modules/licenses/domain/entity/LicenseEntity";
import type {
  LicenseStatsResult,
  RawLicenseValidationLogRecord,
} from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

export class LicenseMapper {
  public static maskSerialKey(rawKey: string): string {
    const cleanKey = (rawKey ?? "").trim();
    if (cleanKey.length < 8) {
      return cleanKey ? `••••-${cleanKey.slice(-4)}` : "••••-••••";
    }

    const first4 = cleanKey.slice(0, 4);
    const last4 = cleanKey.slice(-4);
    return `${first4}-••••-••••-${last4}`;
  }

  public static toDomain(record: PrismaLicense): LicenseEntity {
    return LicenseEntity.create({
      id: record.id,
      serialKey: record.serialKey,
      hwid: record.hwid,
      clientName: record.clientName,
      vaultSecret: record.vaultSecret,
      status: record.status as LicenseStatus,
      expiresAt: record.expiresAt,
      activatedAt: record.activatedAt,
      lastVerifiedAt: record.lastVerifiedAt,
      engineVersion: record.engineVersion,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public static toPersistence(entity: LicenseEntity): {
    id: string;
    serialKey: string;
    hwid: string | null;
    clientName: string;
    vaultSecret: string;
    status: PrismaLicenseStatus;
    expiresAt: Date | null;
    activatedAt: Date | null;
    lastVerifiedAt: Date | null;
    engineVersion: string | null;
  } {
    const props = entity.toPrimitives();
    return {
      id: props.id,
      serialKey: props.serialKey,
      hwid: props.hwid ?? null,
      clientName: props.clientName,
      vaultSecret: props.vaultSecret,
      status: props.status as PrismaLicenseStatus,
      expiresAt: props.expiresAt ?? null,
      activatedAt: props.activatedAt ?? null,
      lastVerifiedAt: props.lastVerifiedAt ?? null,
      engineVersion: props.engineVersion ?? null,
    };
  }

  public static toAdminDTO(
    entity: LicenseEntity,
    role?: UserRole,
    now = new Date(),
  ): LicenseAdminItemDTO {
    const props = entity.toPrimitives();
    const masked = LicenseMapper.maskSerialKey(props.serialKey);
    // AUDITOR hanya melihat masked key untuk serialKey
    const visibleSerialKey = role === "AUDITOR" ? masked : props.serialKey;

    const isBound = Boolean(props.hwid && props.hwid.trim().length > 0);
    const isExpiringSoon = entity.isExpiringSoon(now);

    return {
      id: props.id,
      serialKey: visibleSerialKey,
      serialKeyMasked: masked,
      clientName: props.clientName,
      hwid: props.hwid ?? null,
      isBound,
      status: props.status,
      isExpiringSoon,
      engineVersion: props.engineVersion ?? null,
      activatedAt: props.activatedAt ? props.activatedAt.toISOString() : null,
      lastVerifiedAt: props.lastVerifiedAt ? props.lastVerifiedAt.toISOString() : null,
      expiresAt: props.expiresAt ? props.expiresAt.toISOString() : null,
      createdAt: (props.createdAt ?? new Date()).toISOString(),
    };
  }

  public static toRecentLogDTO(raw: RawLicenseValidationLogRecord): LicenseRecentValidationLogDTO {
    return {
      id: raw.id,
      result: raw.result,
      statusCode: raw.statusCode,
      hwidHash: raw.hwidHash,
      clientIp: raw.clientIp,
      engineVersion: raw.engineVersion,
      latencyMs: raw.latencyMs,
      checkedAt: raw.checkedAt.toISOString(),
    };
  }

  public static toDetailDTO(
    entity: LicenseEntity,
    logs: RawLicenseValidationLogRecord[] = [],
    role?: UserRole,
    now = new Date(),
  ): LicenseDetailResponseDTO {
    const baseAdminDTO = LicenseMapper.toAdminDTO(entity, role, now);
    const recentValidationLogs = logs.map(LicenseMapper.toRecentLogDTO);

    return {
      ...baseAdminDTO,
      recentValidationLogs,
    };
  }

  public static toStatsDTO(stats: LicenseStatsResult): LicenseStatsResponseDTO {
    return {
      totalLicenses: stats.totalLicenses,
      activeLicenses: stats.activeLicenses,
      expiringSoonLicenses: stats.expiringSoonLicenses,
      expiredOrSuspendedLicenses: stats.expiredOrSuspendedLicenses,
      boundDevicesCount: stats.boundDevicesCount,
      unboundActiveCount: stats.unboundActiveCount,
      verifiedLast24hCount: stats.verifiedLast24hCount,
      hwidMismatchLast24hCount: stats.hwidMismatchLast24hCount,
    };
  }
}
