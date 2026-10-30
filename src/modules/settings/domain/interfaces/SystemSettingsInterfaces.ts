import type { SettingCategoryType } from "../../shared/constants/defaultSystemSettings";
import type { PurgeResultDTO, SystemDiagnosticsDTO } from "../dto/SystemSettingsResponseDTO";
import type {
  SettingsDiffRecord,
  SystemConfigurationEntity,
} from "../entity/SystemConfigurationEntity";

export interface EnvironmentDiagnosticsProviderInterface {
  getDiagnostics(): Promise<SystemDiagnosticsDTO>;
}

export interface SystemSettingsRepositoryInterface {
  getAllSettings(): Promise<SystemConfigurationEntity>;
  saveSettings(
    category: SettingCategoryType,
    diffs: SettingsDiffRecord[],
    userId?: string,
    ipAddress?: string,
  ): Promise<void>;
  resetSettings(
    category: SettingCategoryType,
    diffs: SettingsDiffRecord[],
    userId?: string,
    ipAddress?: string,
  ): Promise<void>;
  purgeExpiredLogs(
    target: "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS",
    validationCutoff: Date,
    updateCutoff: Date,
    userId?: string,
    ipAddress?: string,
  ): Promise<PurgeResultDTO>;
}
