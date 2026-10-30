import type {
  LicenseEngineSettingsDTO,
  RetentionAuditSettingsDTO,
  SecurityAuthSettingsDTO,
} from "../dto/SystemSettingsResponseDTO";

export interface BoundsValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SettingsBoundsRule {
  public static readonly BOUNDS = {
    expiringSoonThresholdDays: { min: 7, max: 90 },
    validationRateLimitPerMin: { min: 10, max: 1000 },
    maxFailedLoginAttempts: { min: 3, max: 15 },
    accountLockoutMinutes: { min: 5, max: 1440 },
    sessionTtlHours: { min: 1, max: 168 },
    validationLogRetentionDays: { min: 30, max: 730 },
    updateLogRetentionDays: { min: 30, max: 365 },
  } as const;

  public static readonly ALLOWED_RELEASE_CHANNELS = ["STABLE", "BETA", "NIGHTLY"] as const;

  public static validateLicenseEngine(
    settings: Partial<LicenseEngineSettingsDTO> | Record<string, unknown>,
  ): BoundsValidationResult {
    const errors: string[] = [];

    if (settings.expiringSoonThresholdDays !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.expiringSoonThresholdDays;
      const val = settings.expiringSoonThresholdDays;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Ambang batas segera habis (expiringSoonThresholdDays) harus berupa bilangan bulat antara ${min} dan ${max} hari.`,
        );
      }
    }

    if (settings.defaultReleaseChannel !== undefined) {
      if (
        !SettingsBoundsRule.ALLOWED_RELEASE_CHANNELS.includes(
          settings.defaultReleaseChannel as "STABLE" | "BETA" | "NIGHTLY",
        )
      ) {
        errors.push(
          `Kanal rilis default (defaultReleaseChannel) harus bernilai salah satu dari: ${SettingsBoundsRule.ALLOWED_RELEASE_CHANNELS.join(", ")}.`,
        );
      }
    }

    if (settings.validationRateLimitPerMin !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.validationRateLimitPerMin;
      const val = settings.validationRateLimitPerMin;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Batas validasi per menit (validationRateLimitPerMin) harus berupa bilangan bulat antara ${min} dan ${max}.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateSecurityAuth(
    settings: Partial<SecurityAuthSettingsDTO> | Record<string, unknown>,
  ): BoundsValidationResult {
    const errors: string[] = [];

    if (settings.maxFailedLoginAttempts !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.maxFailedLoginAttempts;
      const val = settings.maxFailedLoginAttempts;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Batas percobaan login gagal (maxFailedLoginAttempts) harus berupa bilangan bulat antara ${min} dan ${max} kali.`,
        );
      }
    }

    if (settings.accountLockoutMinutes !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.accountLockoutMinutes;
      const val = settings.accountLockoutMinutes;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Durasi penguncian akun (accountLockoutMinutes) harus berupa bilangan bulat antara ${min} dan ${max} menit.`,
        );
      }
    }

    if (settings.sessionTtlHours !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.sessionTtlHours;
      const val = settings.sessionTtlHours;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Masa berlaku sesi (sessionTtlHours) harus berupa bilangan bulat antara ${min} dan ${max} jam.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public static validateRetentionAudit(
    settings: Partial<RetentionAuditSettingsDTO> | Record<string, unknown>,
  ): BoundsValidationResult {
    const errors: string[] = [];

    if (settings.validationLogRetentionDays !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.validationLogRetentionDays;
      const val = settings.validationLogRetentionDays;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Masa retensi log validasi (validationLogRetentionDays) harus berupa bilangan bulat antara ${min} dan ${max} hari.`,
        );
      }
    }

    if (settings.updateLogRetentionDays !== undefined) {
      const { min, max } = SettingsBoundsRule.BOUNDS.updateLogRetentionDays;
      const val = settings.updateLogRetentionDays;
      if (typeof val !== "number" || !Number.isInteger(val) || val < min || val > max) {
        errors.push(
          `Masa retensi log update (updateLogRetentionDays) harus berupa bilangan bulat antara ${min} dan ${max} hari.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
