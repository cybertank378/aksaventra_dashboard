import type { LicenseStatus } from "@/modules/licenses/domain/entity/LicenseEntity";

/**
 * Response DTO contract expected by aksaventra_engine client binary
 */
export interface ValidateLicenseSuccessResponseDTO {
  valid: true;
  message: string;
  client_name: string;
  npsn?: string | null;
  vault_secret: string;
  expires_at?: number; // UNIX epoch timestamp in seconds
}

export interface ValidateLicenseErrorResponseDTO {
  valid: false;
  message: string;
}

export type ValidateLicenseResponseDTO =
  | ValidateLicenseSuccessResponseDTO
  | ValidateLicenseErrorResponseDTO;

/**
 * License item DTO for Admin / Operator / Auditor directory views
 * NOTE: vaultSecret is strictly excluded for security!
 */
export interface LicenseAdminItemDTO {
  id: string;
  serialKey: string;
  serialKeyMasked: string;
  clientName: string;
  npsn: string | null;
  userId: string | null;
  hwid: string | null;
  isBound: boolean;
  status: LicenseStatus;
  isExpiringSoon: boolean;
  engineVersion: string | null;
  activatedAt: string | null;
  lastVerifiedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface LicenseListPaginationDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LicenseListResponseDTO {
  licenses: LicenseAdminItemDTO[];
  pagination: LicenseListPaginationDTO;
}

/**
 * Aggregate KPI metrics DTO for License Management & Device Binding
 */
export interface LicenseStatsResponseDTO {
  totalLicenses: number;
  activeLicenses: number;
  expiringSoonLicenses: number;
  expiredOrSuspendedLicenses: number;
  boundDevicesCount: number;
  unboundActiveCount: number;
  verifiedLast24hCount: number;
  hwidMismatchLast24hCount: number;
}

/**
 * Recent validation log record embedded in License Detail response
 */
export interface LicenseRecentValidationLogDTO {
  id: string;
  result: string;
  statusCode: number;
  hwidHash: string | null;
  clientIp: string | null;
  engineVersion: string | null;
  latencyMs: number | null;
  checkedAt: string;
}

/**
 * Full inspection detail for 1 license
 */
export interface LicenseDetailResponseDTO extends LicenseAdminItemDTO {
  recentValidationLogs: LicenseRecentValidationLogDTO[];
}

/**
 * Generic mutation response DTO
 */
export interface LicenseMutationResponseDTO {
  success: boolean;
  message: string;
  license: LicenseAdminItemDTO;
}
