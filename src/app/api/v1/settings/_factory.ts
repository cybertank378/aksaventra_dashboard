import { SystemSettingsServices } from "@/modules/settings/application/services/SystemSettingsServices";
import { SystemSettingsController } from "@/modules/settings/infrastructure/http/SystemSettingsController";
import { EnvironmentDiagnosticsProvider } from "@/modules/settings/infrastructure/providers/EnvironmentDiagnosticsProvider";
import { SystemSettingsRepository } from "@/modules/settings/infrastructure/repo/SystemSettingsRepository";

export function createSystemSettingsController(): SystemSettingsController {
  const repo = new SystemSettingsRepository();
  const diagnosticsProvider = new EnvironmentDiagnosticsProvider();
  const services = new SystemSettingsServices(repo, diagnosticsProvider);
  return new SystemSettingsController(services);
}
