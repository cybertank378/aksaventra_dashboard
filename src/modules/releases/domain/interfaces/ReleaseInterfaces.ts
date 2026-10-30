/* ============================================================
 * RELEASE INTERFACES CONTRACTS
 * ============================================================
 */

import type {
  ReleaseQueryDTO,
  UpdateLogQueryDTO,
} from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import type { EngineUpdateLogEntity } from "@/modules/releases/domain/entity/EngineUpdateLogEntity";
import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export interface EngineReleaseRepositoryInterface {
  findLatestActive(channel: ReleaseChannelType): Promise<EngineReleaseEntity | null>;
  findByVersion(version: string): Promise<EngineReleaseEntity | null>;
  findById(id: string): Promise<EngineReleaseEntity | null>;
  findMany(query: ReleaseQueryDTO): Promise<{ items: EngineReleaseEntity[]; total: number }>;
  save(release: EngineReleaseEntity): Promise<void>;
  update(release: EngineReleaseEntity): Promise<void>;
  delete(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;
  countStats(): Promise<{
    totalReleases: number;
    activeReleases: number;
    totalDownloads: number;
  }>;
}

export interface EngineUpdateLogRepositoryInterface {
  record(log: EngineUpdateLogEntity): Promise<void>;
  findMany(query: UpdateLogQueryDTO): Promise<{ items: EngineUpdateLogEntity[]; total: number }>;
  countTodayChecks(): Promise<number>;
}

export interface StorageUploadResult {
  filePath: string;
  checksumSha256: string;
  fileSize: bigint;
  downloadUrl?: string;
}

export interface StorageDownloadStreamResult {
  stream: NodeJS.ReadableStream | ReadableStream;
  contentLength: number;
  etag: string;
  contentType: string;
}

export interface StorageProviderInterface {
  readonly driver: "local" | "s3";
  saveFile(filename: string, buffer: Buffer, contentType?: string): Promise<StorageUploadResult>;
  getFilePath(filename: string): Promise<string | null>;
  fileExists(filePathOrKey: string): Promise<boolean>;
  getPresignedDownloadUrl?(filenameOrKey: string, expiresInSeconds?: number): Promise<string>;
  getFileStream?(
    filePathOrKey: string,
    range?: { start: number; end: number },
  ): Promise<StorageDownloadStreamResult | null>;
}
