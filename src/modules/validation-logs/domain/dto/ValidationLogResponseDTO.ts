import type { LicenseValidationResult } from "@prisma/client";

export interface ValidationLogItemDTO {
  id: string;
  licenseId: string | null;
  clientName: string | null;
  serialKeyMasked: string;
  serialKeyHint: string;
  hwidHash: string | null;
  result: LicenseValidationResult;
  statusCode: number;
  engineVersion: string | null;
  clientIp: string | null;
  userAgent: string | null;
  latencyMs: number | null;
  isSlaBreached: boolean;
  checkedAt: string;
}

export interface ValidationLogStatsDTO {
  totalRequests24h: number;
  verifiedCount24h: number;
  successRatePercent: number;
  hwidMismatchCount24h: number;
  rejectedCount24h: number;
  avgLatencyMs: number;
}

export interface ValidationLogListResponseDTO {
  logs: ValidationLogItemDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationLogDetailResponseDTO {
  log: ValidationLogItemDTO;
  license?: {
    id: string;
    serialKeyHint: string;
    clientName: string | null;
    status: string;
    expiresAt: string | null;
    currentHwid: string | null;
  } | null;
}
