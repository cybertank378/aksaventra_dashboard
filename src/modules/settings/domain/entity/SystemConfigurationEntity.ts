import {
  DEFAULT_LICENSE_ENGINE_SETTINGS,
  DEFAULT_RETENTION_AUDIT_SETTINGS,
  DEFAULT_SECURITY_AUTH_SETTINGS,
  type SettingCategoryType,
} from "../../shared/constants/defaultSystemSettings";
import type {
  LicenseEngineSettingsDTO,
  RetentionAuditSettingsDTO,
  SecurityAuthSettingsDTO,
  SystemDiagnosticsDTO,
  SystemSettingsResponseDTO,
} from "../dto/SystemSettingsResponseDTO";
import { SettingsBoundsRule } from "../rules/SettingsBoundsRule";

export interface SettingsDiffRecord {
  key: string;
  previousValue: unknown;
  newValue: unknown;
}

export interface SystemConfigurationProps {
  licenseEngine: LicenseEngineSettingsDTO;
  securityAuth: SecurityAuthSettingsDTO;
  retentionAudit: RetentionAuditSettingsDTO;
  lastUpdatedAt?: string | null;
  lastUpdatedByName?: string | null;
}

export class SystemConfigurationEntity {
  private _licenseEngine: LicenseEngineSettingsDTO;
  private _securityAuth: SecurityAuthSettingsDTO;
  private _retentionAudit: RetentionAuditSettingsDTO;
  private _lastUpdatedAt: string | null;
  private _lastUpdatedByName: string | null;

  constructor(props: SystemConfigurationProps) {
    this._licenseEngine = { ...props.licenseEngine };
    this._securityAuth = { ...props.securityAuth };
    this._retentionAudit = { ...props.retentionAudit };
    this._lastUpdatedAt = props.lastUpdatedAt ?? null;
    this._lastUpdatedByName = props.lastUpdatedByName ?? null;
  }

  public get licenseEngine(): LicenseEngineSettingsDTO {
    return { ...this._licenseEngine };
  }

  public get securityAuth(): SecurityAuthSettingsDTO {
    return { ...this._securityAuth };
  }

  public get retentionAudit(): RetentionAuditSettingsDTO {
    return { ...this._retentionAudit };
  }

  public get lastUpdatedAt(): string | null {
    return this._lastUpdatedAt;
  }

  public get lastUpdatedByName(): string | null {
    return this._lastUpdatedByName;
  }

  public updateLicenseEngine(partial: Partial<LicenseEngineSettingsDTO>): SettingsDiffRecord[] {
    const validation = SettingsBoundsRule.validateLicenseEngine(partial);
    if (!validation.isValid) {
      throw new Error(validation.errors.join("; "));
    }

    const diffs: SettingsDiffRecord[] = [];
    for (const [key, val] of Object.entries(partial)) {
      if (val !== undefined) {
        const typedKey = key as keyof LicenseEngineSettingsDTO;
        if (this._licenseEngine[typedKey] !== val) {
          diffs.push({
            key: typedKey,
            previousValue: this._licenseEngine[typedKey],
            newValue: val,
          });
          (this._licenseEngine as unknown as Record<string, unknown>)[typedKey] = val;
        }
      }
    }

    return diffs;
  }

  public updateSecurityAuth(partial: Partial<SecurityAuthSettingsDTO>): SettingsDiffRecord[] {
    const validation = SettingsBoundsRule.validateSecurityAuth(partial);
    if (!validation.isValid) {
      throw new Error(validation.errors.join("; "));
    }

    const diffs: SettingsDiffRecord[] = [];
    for (const [key, val] of Object.entries(partial)) {
      if (val !== undefined) {
        const typedKey = key as keyof SecurityAuthSettingsDTO;
        if (this._securityAuth[typedKey] !== val) {
          diffs.push({
            key: typedKey,
            previousValue: this._securityAuth[typedKey],
            newValue: val,
          });
          (this._securityAuth as unknown as Record<string, unknown>)[typedKey] = val;
        }
      }
    }

    return diffs;
  }

  public updateRetentionAudit(partial: Partial<RetentionAuditSettingsDTO>): SettingsDiffRecord[] {
    const validation = SettingsBoundsRule.validateRetentionAudit(partial);
    if (!validation.isValid) {
      throw new Error(validation.errors.join("; "));
    }

    const diffs: SettingsDiffRecord[] = [];
    for (const [key, val] of Object.entries(partial)) {
      if (val !== undefined) {
        const typedKey = key as keyof RetentionAuditSettingsDTO;
        if (this._retentionAudit[typedKey] !== val) {
          diffs.push({
            key: typedKey,
            previousValue: this._retentionAudit[typedKey],
            newValue: val,
          });
          (this._retentionAudit as unknown as Record<string, unknown>)[typedKey] = val;
        }
      }
    }

    return diffs;
  }

  public resetCategory(category: SettingCategoryType): SettingsDiffRecord[] {
    switch (category) {
      case "LICENSE_ENGINE":
        return this.updateLicenseEngine(DEFAULT_LICENSE_ENGINE_SETTINGS);
      case "SECURITY_AUTH":
        return this.updateSecurityAuth(DEFAULT_SECURITY_AUTH_SETTINGS);
      case "RETENTION_AUDIT":
        return this.updateRetentionAudit(DEFAULT_RETENTION_AUDIT_SETTINGS);
    }
  }

  public calculateValidationLogPurgeCutoff(): Date {
    const ms = this._retentionAudit.validationLogRetentionDays * 24 * 60 * 60 * 1000;
    return new Date(Date.now() - ms);
  }

  public calculateUpdateLogPurgeCutoff(): Date {
    const ms = this._retentionAudit.updateLogRetentionDays * 24 * 60 * 60 * 1000;
    return new Date(Date.now() - ms);
  }

  public toDTO(diagnostics: SystemDiagnosticsDTO): SystemSettingsResponseDTO {
    return {
      licenseEngine: this.licenseEngine,
      securityAuth: this.securityAuth,
      retentionAudit: this.retentionAudit,
      diagnostics,
      lastUpdatedAt: this._lastUpdatedAt,
      lastUpdatedByName: this._lastUpdatedByName,
    };
  }
}
