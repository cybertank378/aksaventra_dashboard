import { EngineMonitorServices } from "@/modules/engine-validation/application/services/EngineMonitorServices";
import { EngineMonitorController } from "@/modules/engine-validation/infrastructure/http/EngineMonitorController";
import { EngineMonitorRepository } from "@/modules/engine-validation/infrastructure/repo/EngineMonitorRepository";

export function createEngineMonitorController(): EngineMonitorController {
  const repo = new EngineMonitorRepository();
  const services = new EngineMonitorServices(repo);
  return new EngineMonitorController(services);
}
