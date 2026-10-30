import type { SettingCategoryType } from "../../shared/constants/defaultSystemSettings";
import type {
  LicenseEngineSettingsDTO,
  RetentionAuditSettingsDTO,
  SecurityAuthSettingsDTO,
} from "./SystemSettingsResponseDTO";

export interface UpdateSystemSettingsDTO {
  category?: SettingCategoryType;
  licenseEngine?: Partial<LicenseEngineSettingsDTO>;
  securityAuth?: Partial<SecurityAuthSettingsDTO>;
  retentionAudit?: Partial<RetentionAuditSettingsDTO>;
}

export interface ResetCategoryDTO {
  category: SettingCategoryType;
}

export interface PurgeLogsDTO {
  target?: "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS";
  confirm: boolean;
}
