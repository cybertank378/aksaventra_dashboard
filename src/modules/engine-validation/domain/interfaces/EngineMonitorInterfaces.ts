import type {
  LiveFeedQueryDTO,
  PatchBinaryStatusDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type {
  BinaryIntegrityItemDTO,
  EngineMonitorSummaryResponseDTO,
  LiveFeedListResponseDTO,
  PatchBinaryStatusResponseDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";

export interface RawReleaseRecord {
  id: string;
  version: string;
  channel: string;
  checksumSha256: string;
  fileSize: number;
  isActive: boolean;
  downloadCount: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawValidationLogRecord {
  id: string;
  licenseId: string | null;
  serialKeyHint: string;
  hwidHash: string | null;
  result: string;
  statusCode: number;
  engineVersion: string | null;
  clientIp: string | null;
  userAgent: string | null;
  latencyMs: number | null;
  checkedAt: Date;
  license?: {
    clientName: string;
    serialKey: string;
  } | null;
}

export interface EngineMonitorRepositoryInterface {
  getSummaryMetrics(): Promise<EngineMonitorSummaryResponseDTO>;
  getLiveFeed(query: LiveFeedQueryDTO): Promise<LiveFeedListResponseDTO>;
  listBinaryReleases(): Promise<BinaryIntegrityItemDTO[]>;
  findBinaryReleaseByVersion(version: string): Promise<RawReleaseRecord | null>;
  findBinaryReleaseById(id: string): Promise<RawReleaseRecord | null>;
  updateBinaryStatus(
    dto: PatchBinaryStatusDTO,
    actorId?: string,
  ): Promise<PatchBinaryStatusResponseDTO>;
}
