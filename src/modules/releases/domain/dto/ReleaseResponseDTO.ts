/* ============================================================
 * RELEASE RESPONSE DTOS
 * ============================================================
 */

import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export interface CheckVersionResponseDTO {
  status: "success";
  has_update: boolean;
  latest_version?: string;
  min_supported_version?: string | null;
  mandatory?: boolean;
  download_url?: string | null;
  checksum_sha256?: string;
  release_notes?: string | null;
  published_at?: number; // UNIX timestamp in seconds
  message?: string;
}

export interface ReleaseItemResponseDTO {
  id: string;
  version: string;
  channel: ReleaseChannelType;
  minSupportedVersion?: string | null;
  mandatory: boolean;
  downloadUrl?: string | null;
  checksumSha256: string;
  fileSize: number;
  releaseNotes?: string | null;
  isActive: boolean;
  downloadCount: number;
  publishedAt: string;
  createdAt: string;
}

export interface ReleaseListResponseDTO {
  items: ReleaseItemResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReleaseStatsResponseDTO {
  totalReleases: number;
  activeReleases: number;
  totalDownloads: number;
  checksToday: number;
}

export interface UpdateLogItemResponseDTO {
  id: string;
  releaseId?: string | null;
  clientVersion: string;
  hwid?: string | null;
  serialKey?: string | null;
  channel: string;
  action: string;
  status: string;
  clientIp?: string | null;
  createdAt: string;
}

export interface UpdateLogListResponseDTO {
  items: UpdateLogItemResponseDTO[];
  total: number;
  page: number;
  limit: number;
}
