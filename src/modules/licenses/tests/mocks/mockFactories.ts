import { vi } from "vitest";
import type {
  LicenseRepositoryInterface,
  LicenseValidationLogRepositoryInterface,
} from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

export function createMockLicenseRepository(): LicenseRepositoryInterface {
  return {
    findBySerialKey: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockLicenseValidationLogRepository(): LicenseValidationLogRepositoryInterface {
  return {
    record: vi.fn().mockResolvedValue(undefined),
  };
}
