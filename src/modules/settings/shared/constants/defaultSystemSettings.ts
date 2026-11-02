export interface LicenseEngineSettings {
  expiringSoonThresholdDays: number;
  defaultReleaseChannel: "STABLE" | "BETA" | "NIGHTLY";
  enforceBinaryIntegrityCheck: boolean;
  blockOutdatedEngineClients: boolean;
  validationRateLimitPerMin: number;
  maintenanceMode: boolean;
}

export interface SecurityAuthSettings {
  maxFailedLoginAttempts: number;
  accountLockoutMinutes: number;
  sessionTtlHours: number;
  requireEmailVerification: boolean;
}

export interface RetentionAuditSettings {
  validationLogRetentionDays: number;
  updateLogRetentionDays: number;
}

export interface AllSystemSettings {
  licenseEngine: LicenseEngineSettings;
  securityAuth: SecurityAuthSettings;
  retentionAudit: RetentionAuditSettings;
}

export const DEFAULT_LICENSE_ENGINE_SETTINGS: LicenseEngineSettings = {
  expiringSoonThresholdDays: 30,
  defaultReleaseChannel: "STABLE",
  enforceBinaryIntegrityCheck: true,
  blockOutdatedEngineClients: true,
  validationRateLimitPerMin: 60,
  maintenanceMode: false,
};

export const DEFAULT_SECURITY_AUTH_SETTINGS: SecurityAuthSettings = {
  maxFailedLoginAttempts: 5,
  accountLockoutMinutes: 30,
  sessionTtlHours: 24,
  requireEmailVerification: true,
};

export const DEFAULT_RETENTION_AUDIT_SETTINGS: RetentionAuditSettings = {
  validationLogRetentionDays: 180,
  updateLogRetentionDays: 90,
};

export const DEFAULT_SYSTEM_SETTINGS: AllSystemSettings = {
  licenseEngine: DEFAULT_LICENSE_ENGINE_SETTINGS,
  securityAuth: DEFAULT_SECURITY_AUTH_SETTINGS,
  retentionAudit: DEFAULT_RETENTION_AUDIT_SETTINGS,
};

export type SettingCategoryType = "LICENSE_ENGINE" | "SECURITY_AUTH" | "RETENTION_AUDIT";
