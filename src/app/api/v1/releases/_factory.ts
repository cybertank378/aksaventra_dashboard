/* ============================================================
 * BUILD RELEASE ADMIN CONTROLLER FACTORY
 * ============================================================
 */

import { ReleaseServices } from "@/modules/releases/application/services/ReleaseServices";
import { ReleaseAdminController } from "@/modules/releases/infrastructure/http/ReleaseAdminController";
import { EngineReleaseRepository } from "@/modules/releases/infrastructure/repo/EngineReleaseRepository";
import { EngineUpdateLogRepository } from "@/modules/releases/infrastructure/repo/EngineUpdateLogRepository";
import { createStorageProvider } from "@/modules/releases/infrastructure/storage/StorageFactory";

export function buildReleaseAdminController(): ReleaseAdminController {
  const releaseRepo = new EngineReleaseRepository();
  const logRepo = new EngineUpdateLogRepository();
  const storage = createStorageProvider();
  const releaseServices = new ReleaseServices(releaseRepo, logRepo);

  return new ReleaseAdminController(releaseServices, storage);
}
