import type { LicenseStatus } from "@/modules/licenses/domain/entity/LicenseEntity";

/**
 * Request DTO for validating engine license from aksaventra_engine
 */
export interface ValidateLicenseRequestDTO {
  serial_key: string;
  hwid: string;
  engine_version?: string;
  public_ip?: string;
  clientIp?: string;
  userAgent?: string;
}

/**
 * Request query DTO for listing licenses with filters and pagination
 */
export interface LicenseQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ALL" | LicenseStatus;
  binding?: "ALL" | "BOUND" | "UNBOUND";
  userId?: string;
  npsn?: string;
  expiringSoon?: boolean;
  sortBy?: "createdAt" | "expiresAt" | "lastVerifiedAt" | "clientName";
  sortOrder?: "asc" | "desc";
}

/**
 * Request DTO for creating a new license
 */
export interface CreateLicenseDTO {
  clientName: string;
  npsn?: string;
  userId?: string;
  tier?: "TRIAL" | "PRO" | "ENTERPRISE";
  durationMonths?: number;
  expiresAt?: string;
  engineVersion?: string;
  customSerialKey?: string;
  vaultSecret?: string;
}

/**
 * Request DTO for resetting device HWID binding
 */
export interface ResetHwidDTO {
  reason?: string;
}

/**
 * Request DTO for updating license status / extending expiration
 */
export interface UpdateLicenseStatusDTO {
  status?: "ACTIVE" | "SUSPENDED";
  expiresAt?: string;
  reason?: string;
}
