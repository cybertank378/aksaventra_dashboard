import type { BinaryIntegrityOutcome } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

export interface EngineMonitorSummaryResponseDTO {
  requestsLast15m: number;
  requestsPerMinuteRate: number;
  avgLatencyMs24h: number;
  p95LatencyMs24h: number;
  slaCompliancePercent24h: number;
  onlineDevices24h: number;
  anomaliesLast1h: number;
  outcomeBreakdown24h: {
    verifiedCount: number;
    activatedCount: number;
    mismatchCount: number;
    rejectedCount: number;
    totalCount: number;
  };
  clientVersionDistribution: Array<{
    engineVersion: string;
    deviceCount: number;
    percent: number;
    isLatestStable: boolean;
  }>;
  latestActiveRelease: {
    version: string;
    channel: string;
    checksumSha256: string;
    publishedAt: string;
  } | null;
}

export interface LiveFeedItemDTO {
  id: string;
  licenseId: string | null;
  clientName: string | null;
  serialKeyMasked: string;
  serialKeyHint: string;
  hwidHash: string | null;
  result: string;
  statusCode: number;
  engineVersion: string | null;
  clientIp: string | null;
  latencyMs: number | null;
  isSlaBreached: boolean;
  checkedAt: string;
}

export interface LiveFeedListResponseDTO {
  items: LiveFeedItemDTO[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface BinaryIntegrityItemDTO {
  id: string;
  version: string;
  channel: string;
  checksumSha256: string;
  fileSize: number;
  isActive: boolean;
  downloadCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyChecksumResponseDTO {
  version: string;
  providedHash: string;
  expectedHash: string | null;
  outcome: BinaryIntegrityOutcome;
  isTrusted: boolean;
  releaseId?: string | null;
  channel?: string | null;
  checkedAt: string;
}

export interface PatchBinaryStatusResponseDTO {
  id: string;
  version: string;
  isActive: boolean;
  updatedAt: string;
}
