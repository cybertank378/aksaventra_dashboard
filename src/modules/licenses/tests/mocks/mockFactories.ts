import { vi } from "vitest";
import type {
  LicenseRepositoryInterface,
  LicenseValidationLogRepositoryInterface,
} from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

export function createMockLicenseRepository(): LicenseRepositoryInterface {
  return {
    findBySerialKey: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    findManyPaginated: vi.fn().mockResolvedValue({ licenses: [], total: 0 }),
    getStats: vi.fn().mockResolvedValue({
      totalLicenses: 0,
      activeLicenses: 0,
      expiringSoonLicenses: 0,
      expiredOrSuspendedLicenses: 0,
      boundDevicesCount: 0,
      unboundActiveCount: 0,
      verifiedLast24hCount: 0,
      hwidMismatchLast24hCount: 0,
    }),
    findByIdWithRecentLogs: vi.fn().mockResolvedValue(null),
  };
}

export function createMockLicenseValidationLogRepository(): LicenseValidationLogRepositoryInterface {
  return {
    record: vi.fn().mockResolvedValue(undefined),
    findRecentByLicenseId: vi.fn().mockResolvedValue([]),
  };
}
