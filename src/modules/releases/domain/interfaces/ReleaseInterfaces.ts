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

export interface StorageProviderInterface {
  saveFile(
    filename: string,
    buffer: Buffer,
  ): Promise<{ filePath: string; checksumSha256: string; fileSize: bigint }>;
  getFilePath(filename: string): Promise<string | null>;
  fileExists(filePath: string): Promise<boolean>;
}
