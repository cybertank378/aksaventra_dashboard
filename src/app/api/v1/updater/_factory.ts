/* ============================================================
 * BUILD UPDATER CONTROLLER FACTORY
 * ============================================================
 */

import { ReleaseServices } from "@/modules/releases/application/services/ReleaseServices";
import { UpdaterController } from "@/modules/releases/infrastructure/http/UpdaterController";
import { EngineReleaseRepository } from "@/modules/releases/infrastructure/repo/EngineReleaseRepository";
import { EngineUpdateLogRepository } from "@/modules/releases/infrastructure/repo/EngineUpdateLogRepository";
import { createStorageProvider } from "@/modules/releases/infrastructure/storage/StorageFactory";

export function buildUpdaterController(): UpdaterController {
  const releaseRepo = new EngineReleaseRepository();
  const logRepo = new EngineUpdateLogRepository();
  const storage = createStorageProvider();
  const releaseServices = new ReleaseServices(releaseRepo, logRepo);

  return new UpdaterController(releaseServices, storage);
}
