import type { UpdateSystemSettingsDTO } from "../../domain/dto/SystemSettingsRequestDTO";
import type { SystemSettingsResponseDTO } from "../../domain/dto/SystemSettingsResponseDTO";
import type { SettingsDiffRecord } from "../../domain/entity/SystemConfigurationEntity";
import type {
  EnvironmentDiagnosticsProviderInterface,
  SystemSettingsRepositoryInterface,
} from "../../domain/interfaces/SystemSettingsInterfaces";
import type { SettingCategoryType } from "../../shared/constants/defaultSystemSettings";

export class UpdateSystemSettingsUseCase {
  constructor(
    private readonly repository: SystemSettingsRepositoryInterface,
    private readonly diagnosticsProvider: EnvironmentDiagnosticsProviderInterface,
  ) {}

  public async execute(
    dto: UpdateSystemSettingsDTO,
    userId?: string,
    ipAddress?: string,
  ): Promise<SystemSettingsResponseDTO> {
    const entity = await this.repository.getAllSettings();
    let category: SettingCategoryType = dto.category ?? "LICENSE_ENGINE";
    let diffs: SettingsDiffRecord[] = [];

    if (dto.licenseEngine) {
      category = "LICENSE_ENGINE";
      diffs = entity.updateLicenseEngine(dto.licenseEngine);
    } else if (dto.securityAuth) {
      category = "SECURITY_AUTH";
      diffs = entity.updateSecurityAuth(dto.securityAuth);
    } else if (dto.retentionAudit) {
      category = "RETENTION_AUDIT";
      diffs = entity.updateRetentionAudit(dto.retentionAudit);
    }

    if (diffs.length > 0) {
      await this.repository.saveSettings(category, diffs, userId, ipAddress);
    }

    const diagnostics = await this.diagnosticsProvider.getDiagnostics();
    return entity.toDTO(diagnostics);
  }
}
