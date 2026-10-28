import { vi } from "vitest";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

export function createMockLicenseRepository(): LicenseRepositoryInterface {
  return {
    findBySerialKey: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  };
}
