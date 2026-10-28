/* ============================================================
 * BUILD LICENSE CONTROLLER
 * ============================================================
 */

import { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseController } from "@/modules/licenses/infrastructure/http/LicenseController";
import { LicenseRepository } from "@/modules/licenses/infrastructure/repo/LicenseRepository";

export function buildLicenseController(): LicenseController {
  //////////////////////////////////////////////////////////////
  // REPOSITORY
  //////////////////////////////////////////////////////////////

  const repository = new LicenseRepository();

  //////////////////////////////////////////////////////////////
  // SERVICE
  //////////////////////////////////////////////////////////////

  const licenseServices = new LicenseServices(repository);

  //////////////////////////////////////////////////////////////
  // CONTROLLER
  //////////////////////////////////////////////////////////////

  return new LicenseController(licenseServices);
}
