import type {
  PurgeLogsDTO,
  ResetCategoryDTO,
  UpdateSystemSettingsDTO,
} from "../../domain/dto/SystemSettingsRequestDTO";
import { SettingsBoundsRule } from "../../domain/rules/SettingsBoundsRule";
import type { SettingCategoryType } from "../../shared/constants/defaultSystemSettings";

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
}

export class SystemSettingsValidator {
  public static readonly ALLOWED_CATEGORIES: SettingCategoryType[] = [
    "LICENSE_ENGINE",
    "SECURITY_AUTH",
    "RETENTION_AUDIT",
  ];

  public static validateUpdate(body: unknown): ValidationResult<UpdateSystemSettingsDTO> {
    const errors: string[] = [];

    if (!body || typeof body !== "object") {
      return {
        isValid: false,
        errors: ["Payload permintaan pembaruan pengaturan harus berupa objek JSON valid."],
      };
    }

    const rec = body as Record<string, unknown>;
    const category = rec.category as SettingCategoryType | undefined;

    if (!category || !SystemSettingsValidator.ALLOWED_CATEGORIES.includes(category)) {
      errors.push(
        `Kategori pengaturan tidak valid. Harus salah satu dari: ${SystemSettingsValidator.ALLOWED_CATEGORIES.join(", ")}.`,
      );
    }

    const resultDTO: UpdateSystemSettingsDTO = {
      category,
    };

    if (category === "LICENSE_ENGINE") {
      const licenseEngine = (rec.licenseEngine as Record<string, unknown>) || {};
      const bounds = SettingsBoundsRule.validateLicenseEngine(licenseEngine);
      if (!bounds.isValid) {
        errors.push(...bounds.errors);
      }
      resultDTO.licenseEngine = licenseEngine;
    } else if (category === "SECURITY_AUTH") {
      const securityAuth = (rec.securityAuth as Record<string, unknown>) || {};
      const bounds = SettingsBoundsRule.validateSecurityAuth(securityAuth);
      if (!bounds.isValid) {
        errors.push(...bounds.errors);
      }
      resultDTO.securityAuth = securityAuth;
    } else if (category === "RETENTION_AUDIT") {
      const retentionAudit = (rec.retentionAudit as Record<string, unknown>) || {};
      const bounds = SettingsBoundsRule.validateRetentionAudit(retentionAudit);
      if (!bounds.isValid) {
        errors.push(...bounds.errors);
      }
      resultDTO.retentionAudit = retentionAudit;
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? resultDTO : undefined,
      errors,
    };
  }

  public static validateReset(body: unknown): ValidationResult<ResetCategoryDTO> {
    const errors: string[] = [];

    if (!body || typeof body !== "object") {
      return {
        isValid: false,
        errors: ["Payload permintaan reset harus berupa objek JSON valid."],
      };
    }

    const rec = body as Record<string, unknown>;
    const category = rec.category as SettingCategoryType | undefined;

    if (!category || !SystemSettingsValidator.ALLOWED_CATEGORIES.includes(category)) {
      errors.push(
        `Kategori yang akan di-reset tidak valid. Harus salah satu dari: ${SystemSettingsValidator.ALLOWED_CATEGORIES.join(", ")}.`,
      );
    }

    return {
      isValid: errors.length === 0,
      data: errors.length === 0 && category ? { category } : undefined,
      errors,
    };
  }

  public static validatePurge(body: unknown): ValidationResult<PurgeLogsDTO> {
    const errors: string[] = [];

    if (!body || typeof body !== "object") {
      return {
        isValid: false,
        errors: ["Payload permintaan pembersihan log harus berupa objek JSON valid."],
      };
    }

    const rec = body as Record<string, unknown>;
    const target = rec.target as "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS" | undefined;
    const confirm = rec.confirm;

    const allowedTargets = ["ALL", "VALIDATION_LOGS", "UPDATE_LOGS"];
    if (target && !allowedTargets.includes(target)) {
      errors.push(`Target pembersihan log harus salah satu dari: ${allowedTargets.join(", ")}.`);
    }

    if (confirm !== true) {
      errors.push("Konfirmasi pembersihan log diperlukan (confirm: true).");
    }

    return {
      isValid: errors.length === 0,
      data:
        errors.length === 0
          ? {
              target: target ?? "ALL",
              confirm: true,
            }
          : undefined,
      errors,
    };
  }
}
