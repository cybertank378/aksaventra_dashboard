import { ValidationLogServices } from "@/modules/validation-logs/application/services/ValidationLogServices";
import { ValidationLogController } from "@/modules/validation-logs/infrastructure/http/ValidationLogController";
import { ValidationLogQueryRepository } from "@/modules/validation-logs/infrastructure/repo/ValidationLogQueryRepository";

export function buildValidationLogController(): ValidationLogController {
  const repo = new ValidationLogQueryRepository();
  const services = new ValidationLogServices(repo);
  return new ValidationLogController(services);
}
