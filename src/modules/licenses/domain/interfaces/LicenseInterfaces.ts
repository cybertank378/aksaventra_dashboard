import type { LicenseEntity } from "../entity/LicenseEntity";

export interface LicenseRepositoryInterface {
  findBySerialKey(serialKey: string): Promise<LicenseEntity | null>;
  save(license: LicenseEntity): Promise<void>;
  update(license: LicenseEntity): Promise<void>;
}
