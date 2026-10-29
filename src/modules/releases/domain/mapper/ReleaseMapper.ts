/* ============================================================
 * RELEASE MAPPER
 * ============================================================
 */

import type {
  EngineRelease as PrismaRelease,
  ReleaseChannel as PrismaReleaseChannel,
  EngineUpdateLog as PrismaUpdateLog,
} from "@prisma/client";
import { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import {
  EngineUpdateLogEntity,
  type UpdateActionType,
  type UpdateStatusType,
} from "@/modules/releases/domain/entity/EngineUpdateLogEntity";
import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export class ReleaseMapper {
  public static toReleaseDomain(record: PrismaRelease): EngineReleaseEntity {
    return EngineReleaseEntity.create({
      id: record.id,
      version: record.version,
      channel: record.channel as ReleaseChannelType,
      minSupportedVersion: record.minSupportedVersion,
      mandatory: record.mandatory,
      downloadUrl: record.downloadUrl,
      filePath: record.filePath,
      checksumSha256: record.checksumSha256,
      fileSize: record.fileSize,
      releaseNotes: record.releaseNotes,
      isActive: record.isActive,
      downloadCount: record.downloadCount,
      publishedAt: record.publishedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public static toReleasePersistence(entity: EngineReleaseEntity): {
    id: string;
    version: string;
    channel: PrismaReleaseChannel;
    minSupportedVersion: string | null;
    mandatory: boolean;
    downloadUrl: string | null;
    filePath: string | null;
    checksumSha256: string;
    fileSize: bigint;
    releaseNotes: string | null;
    isActive: boolean;
    downloadCount: number;
    publishedAt: Date;
  } {
    const p = entity.toPrimitives();
    return {
      id: p.id,
      version: p.version,
      channel: p.channel as PrismaReleaseChannel,
      minSupportedVersion: p.minSupportedVersion ?? null,
      mandatory: p.mandatory,
      downloadUrl: p.downloadUrl ?? null,
      filePath: p.filePath ?? null,
      checksumSha256: p.checksumSha256,
      fileSize: BigInt(p.fileSize),
      releaseNotes: p.releaseNotes ?? null,
      isActive: p.isActive,
      downloadCount: p.downloadCount,
      publishedAt: p.publishedAt,
    };
  }

  public static toUpdateLogDomain(record: PrismaUpdateLog): EngineUpdateLogEntity {
    return EngineUpdateLogEntity.create({
      id: record.id,
      releaseId: record.releaseId,
      clientVersion: record.clientVersion,
      hwid: record.hwid,
      serialKey: record.serialKey,
      channel: record.channel,
      action: record.action as UpdateActionType,
      status: record.status as UpdateStatusType,
      clientIp: record.clientIp,
      userAgent: record.userAgent,
      createdAt: record.createdAt,
    });
  }
}
