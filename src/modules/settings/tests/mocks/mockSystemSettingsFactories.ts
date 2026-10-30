import type {
  PurgeResultDTO,
  SystemDiagnosticsDTO,
} from "../../domain/dto/SystemSettingsResponseDTO";
import { SystemConfigurationEntity } from "../../domain/entity/SystemConfigurationEntity";
import type {
  EnvironmentDiagnosticsProviderInterface,
  SystemSettingsRepositoryInterface,
} from "../../domain/interfaces/SystemSettingsInterfaces";
import {
  DEFAULT_LICENSE_ENGINE_SETTINGS,
  DEFAULT_RETENTION_AUDIT_SETTINGS,
  DEFAULT_SECURITY_AUTH_SETTINGS,
} from "../../shared/constants/defaultSystemSettings";

export function createMockSystemDiagnostics(
  overrides?: Partial<SystemDiagnosticsDTO>,
): SystemDiagnosticsDTO {
  return {
    storageDriver: "local",
    storageHealthy: true,
    databaseConnected: true,
    vaultSecretConfigured: true,
    smtpConfigured: true,
    targetSlaLatencyMs: 200,
    appTimezone: "Asia/Jakarta",
    ...overrides,
  };
}

export function createMockSystemConfigurationEntity(
  overrides?: Partial<SystemConfigurationEntity>,
): SystemConfigurationEntity {
  const entity = new SystemConfigurationEntity({
    licenseEngine: { ...DEFAULT_LICENSE_ENGINE_SETTINGS },
    securityAuth: { ...DEFAULT_SECURITY_AUTH_SETTINGS },
    retentionAudit: { ...DEFAULT_RETENTION_AUDIT_SETTINGS },
    lastUpdatedAt: "2026-10-30T08:15:00.000Z",
    lastUpdatedByName: "Super Admin",
  });
  return Object.assign(entity, overrides);
}

export function createMockDiagnosticsProvider(
  diagnostics = createMockSystemDiagnostics(),
): EnvironmentDiagnosticsProviderInterface {
  return {
    getDiagnostics: async () => diagnostics,
  };
}

export function createMockSystemSettingsRepository(): SystemSettingsRepositoryInterface {
  const entity = createMockSystemConfigurationEntity();
  return {
    getAllSettings: async () => entity,
    saveSettings: async () => {},
    resetSettings: async () => {},
    purgeExpiredLogs: async (
      _target: "ALL" | "VALIDATION_LOGS" | "UPDATE_LOGS",
      _validationCutoff: Date,
      _updateCutoff: Date,
    ): Promise<PurgeResultDTO> => ({
      purgedValidationLogsCount: 42,
      purgedUpdateLogsCount: 10,
      totalPurgedCount: 52,
      purgedBeforeDate: new Date().toISOString(),
    }),
  };
}
