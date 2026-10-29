/* ============================================================
 * BUILD LICENSE CONTROLLER
 * ============================================================
 */

import { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseController } from "@/modules/licenses/infrastructure/http/LicenseController";
import { LicenseRepository } from "@/modules/licenses/infrastructure/repo/LicenseRepository";
import { LicenseValidationLogRepository } from "@/modules/licenses/infrastructure/repo/LicenseValidationLogRepository";

export function buildLicenseController(): LicenseController {
  //////////////////////////////////////////////////////////////
  // REPOSITORY
  //////////////////////////////////////////////////////////////

  const repository = new LicenseRepository();
  const validationLogRepository = new LicenseValidationLogRepository();

  //////////////////////////////////////////////////////////////
  // SERVICE
  //////////////////////////////////////////////////////////////

  const licenseServices = new LicenseServices(repository, validationLogRepository);

  //////////////////////////////////////////////////////////////
  // CONTROLLER
  //////////////////////////////////////////////////////////////

  return new LicenseController(licenseServices);
}
