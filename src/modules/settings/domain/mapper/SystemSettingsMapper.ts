import {
  DEFAULT_LICENSE_ENGINE_SETTINGS,
  DEFAULT_RETENTION_AUDIT_SETTINGS,
  DEFAULT_SECURITY_AUTH_SETTINGS,
} from "../../shared/constants/defaultSystemSettings";
import type {
  LicenseEngineSettingsDTO,
  RetentionAuditSettingsDTO,
  SecurityAuthSettingsDTO,
} from "../dto/SystemSettingsResponseDTO";
import { SystemConfigurationEntity } from "../entity/SystemConfigurationEntity";

export interface RawSystemSettingRecord {
  key: string;
  category: string;
  value: string;
  valueType: string;
  description?: string | null;
  updatedAt: Date;
  updatedBy?: {
    name: string | null;
  } | null;
}

export class SystemSettingsMapper {
  public static parseValue(value: string, valueType: string): unknown {
    if (valueType === "number") {
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
    if (valueType === "boolean") {
      return value === "true" || value === "1";
    }
    return value;
  }

  public static toEntity(records: RawSystemSettingRecord[]): SystemConfigurationEntity {
    const licenseEngine: LicenseEngineSettingsDTO = { ...DEFAULT_LICENSE_ENGINE_SETTINGS };
    const securityAuth: SecurityAuthSettingsDTO = { ...DEFAULT_SECURITY_AUTH_SETTINGS };
    const retentionAudit: RetentionAuditSettingsDTO = { ...DEFAULT_RETENTION_AUDIT_SETTINGS };

    let latestUpdatedAt: Date | null = null;
    let latestUpdatedByName: string | null = null;

    for (const record of records) {
      if (!latestUpdatedAt || record.updatedAt > latestUpdatedAt) {
        latestUpdatedAt = record.updatedAt;
        if (record.updatedBy?.name) {
          latestUpdatedByName = record.updatedBy.name;
        }
      }

      const parsedVal = SystemSettingsMapper.parseValue(record.value, record.valueType);

      // Map to licenseEngine
      if (record.category === "LICENSE_ENGINE") {
        if (record.key in licenseEngine) {
          // @ts-expect-error dynamic key assignment
          licenseEngine[record.key] = parsedVal;
        }
      }

      // Map to securityAuth
      if (record.category === "SECURITY_AUTH") {
        if (record.key in securityAuth) {
          // @ts-expect-error dynamic key assignment
          securityAuth[record.key] = parsedVal;
        }
      }

      // Map to retentionAudit
      if (record.category === "RETENTION_AUDIT") {
        if (record.key in retentionAudit) {
          // @ts-expect-error dynamic key assignment
          retentionAudit[record.key] = parsedVal;
        }
      }
    }

    return new SystemConfigurationEntity({
      licenseEngine,
      securityAuth,
      retentionAudit,
      lastUpdatedAt: latestUpdatedAt ? latestUpdatedAt.toISOString() : null,
      lastUpdatedByName: latestUpdatedByName,
    });
  }
}
