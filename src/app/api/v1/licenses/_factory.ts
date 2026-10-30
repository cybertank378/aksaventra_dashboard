import { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseAdminController } from "@/modules/licenses/infrastructure/http/LicenseAdminController";
import { LicenseRepository } from "@/modules/licenses/infrastructure/repo/LicenseRepository";
import { LicenseValidationLogRepository } from "@/modules/licenses/infrastructure/repo/LicenseValidationLogRepository";

export function buildLicenseAdminController(): LicenseAdminController {
  const licenseRepo = new LicenseRepository();
  const validationLogRepo = new LicenseValidationLogRepository();
  const licenseServices = new LicenseServices(licenseRepo, validationLogRepo);

  return new LicenseAdminController(licenseServices);
}
