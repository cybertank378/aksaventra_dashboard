import type { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import type { LicenseValidationLogEntity } from "@/modules/licenses/domain/entity/LicenseValidationLogEntity";

export interface LicenseRepositoryInterface {
  findBySerialKey(serialKey: string): Promise<LicenseEntity | null>;
  save(license: LicenseEntity): Promise<void>;
  update(license: LicenseEntity): Promise<void>;
}

export interface LicenseValidationLogRepositoryInterface {
  record(log: LicenseValidationLogEntity): Promise<void>;
}
