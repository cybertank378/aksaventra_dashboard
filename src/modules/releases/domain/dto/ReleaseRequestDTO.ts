/* ============================================================
 * RELEASE REQUEST DTOS
 * ============================================================
 */

import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export interface CheckVersionRequestDTO {
  client_version: string;
  hwid?: string | null;
  serial_key?: string | null;
  channel?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
}

export interface CreateReleaseRequestDTO {
  version: string;
  channel?: ReleaseChannelType;
  minSupportedVersion?: string | null;
  mandatory?: boolean;
  downloadUrl?: string | null;
  filePath?: string | null;
  checksumSha256: string;
  fileSize: number | bigint;
  releaseNotes?: string | null;
  isActive?: boolean;
}

export interface UpdateReleaseRequestDTO {
  id: string;
  isActive?: boolean;
  mandatory?: boolean;
  releaseNotes?: string | null;
  minSupportedVersion?: string | null;
}

export interface ReleaseQueryDTO {
  channel?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateLogQueryDTO {
  action?: string;
  channel?: string;
  page?: number;
  limit?: number;
}
