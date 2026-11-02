export interface LicenseEngineSettingsDTO {
  expiringSoonThresholdDays: number;
  defaultReleaseChannel: "STABLE" | "BETA" | "NIGHTLY";
  enforceBinaryIntegrityCheck: boolean;
  blockOutdatedEngineClients: boolean;
  validationRateLimitPerMin: number;
  maintenanceMode: boolean;
}

export interface SecurityAuthSettingsDTO {
  maxFailedLoginAttempts: number;
  accountLockoutMinutes: number;
  sessionTtlHours: number;
  requireEmailVerification: boolean;
}

export interface RetentionAuditSettingsDTO {
  validationLogRetentionDays: number;
  updateLogRetentionDays: number;
}

export interface SystemDiagnosticsDTO {
  storageDriver: "local" | "s3";
  storageHealthy: boolean;
  databaseConnected: boolean;
  vaultSecretConfigured: boolean;
  smtpConfigured: boolean;
  targetSlaLatencyMs: number;
  appTimezone: string;
}

export interface SystemSettingsResponseDTO {
  licenseEngine: LicenseEngineSettingsDTO;
  securityAuth: SecurityAuthSettingsDTO;
  retentionAudit: RetentionAuditSettingsDTO;
  diagnostics: SystemDiagnosticsDTO;
  lastUpdatedAt: string | null;
  lastUpdatedByName: string | null;
}

export interface PurgeResultDTO {
  purgedValidationLogsCount: number;
  purgedUpdateLogsCount: number;
  totalPurgedCount: number;
  purgedBeforeDate: string;
}
