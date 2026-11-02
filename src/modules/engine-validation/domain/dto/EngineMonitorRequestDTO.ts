import type { LiveFeedGroup } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

export interface LiveFeedQueryDTO {
  page?: number;
  limit?: number;
  group?: LiveFeedGroup;
  engineVersion?: string;
  search?: string;
}

export interface VerifyChecksumRequestDTO {
  version: string;
  sha256Hash: string;
}

export interface PatchBinaryStatusDTO {
  id: string;
  isActive: boolean;
  reason?: string;
}
