import type { LicenseEntity, LicenseStatus } from "@/modules/licenses/domain/entity/LicenseEntity";
import type { LicenseValidationLogEntity } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";

export interface LicenseQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: "ALL" | LicenseStatus;
  binding?: "ALL" | "BOUND" | "UNBOUND";
  expiringSoon?: boolean;
  sortBy?: "createdAt" | "expiresAt" | "lastVerifiedAt" | "clientName";
  sortOrder?: "asc" | "desc";
}

export interface LicenseStatsResult {
  totalLicenses: number;
  activeLicenses: number;
  expiringSoonLicenses: number;
  expiredOrSuspendedLicenses: number;
  boundDevicesCount: number;
  unboundActiveCount: number;
  verifiedLast24hCount: number;
  hwidMismatchLast24hCount: number;
}

export interface RawLicenseValidationLogRecord {
  id: string;
  result: string;
  statusCode: number;
  hwidHash: string | null;
  clientIp: string | null;
  engineVersion: string | null;
  latencyMs: number | null;
  checkedAt: Date;
}

export interface LicenseWithLogsResult {
  license: LicenseEntity;
  logs: RawLicenseValidationLogRecord[];
}

export interface AuditLogPayload {
  userId?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}

export interface LicenseRepositoryInterface {
  findBySerialKey(serialKey: string): Promise<LicenseEntity | null>;
  findById(id: string): Promise<LicenseEntity | null>;
  save(license: LicenseEntity, audit?: AuditLogPayload): Promise<void>;
  update(license: LicenseEntity, audit?: AuditLogPayload): Promise<void>;
  findManyPaginated(
    params: LicenseQueryParams,
  ): Promise<{ licenses: LicenseEntity[]; total: number }>;
  getStats(now?: Date): Promise<LicenseStatsResult>;
  findByIdWithRecentLogs(id: string, logLimit?: number): Promise<LicenseWithLogsResult | null>;
  recordAuditLog?(audit: AuditLogPayload): Promise<void>;
}

export interface LicenseValidationLogRepositoryInterface {
  record(log: LicenseValidationLogEntity): Promise<void>;
  findRecentByLicenseId?(
    licenseId: string,
    limit?: number,
  ): Promise<RawLicenseValidationLogRecord[]>;
}
