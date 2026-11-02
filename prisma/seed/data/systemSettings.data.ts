import type { SettingCategory } from "@prisma/client";

export interface SystemSettingSeedItem {
  key: string;
  category: SettingCategory;
  value: string;
  valueType: "number" | "boolean" | "string";
  description: string;
}

export const INITIAL_SYSTEM_SETTINGS: SystemSettingSeedItem[] = [
  // LICENSE_ENGINE
  {
    key: "expiringSoonThresholdDays",
    category: "LICENSE_ENGINE",
    value: "30",
    valueType: "number",
    description: "Ambang batas peringatan lisensi akan segera kedaluwarsa (dalam hari)",
  },
  {
    key: "defaultReleaseChannel",
    category: "LICENSE_ENGINE",
    value: "STABLE",
    valueType: "string",
    description: "Kanal default engine auto-updater untuk klien aksaventra_engine",
  },
  {
    key: "enforceBinaryIntegrityCheck",
    category: "LICENSE_ENGINE",
    value: "true",
    valueType: "boolean",
    description: "Wajibkan verifikasi checksum SHA-256 binary engine sebelum validasi lisensi",
  },
  {
    key: "blockOutdatedEngineClients",
    category: "LICENSE_ENGINE",
    value: "true",
    valueType: "boolean",
    description: "Tolak engine klien yang versinya di bawah minSupportedVersion",
  },
  {
    key: "validationRateLimitPerMin",
    category: "LICENSE_ENGINE",
    value: "60",
    valueType: "number",
    description: "Batas permintaan validasi lisensi per IP/Serial Key per menit",
  },
  {
    key: "maintenanceMode",
    category: "LICENSE_ENGINE",
    value: "false",
    valueType: "boolean",
    description: "Mode pemeliharaan sistem (menolak validasi engine non-admin sementara waktu)",
  },

  // SECURITY_AUTH
  {
    key: "maxFailedLoginAttempts",
    category: "SECURITY_AUTH",
    value: "5",
    valueType: "number",
    description: "Batas percobaan login gagal sebelum akun pengguna dikunci otomatis",
  },
  {
    key: "accountLockoutMinutes",
    category: "SECURITY_AUTH",
    value: "30",
    valueType: "number",
    description: "Durasi penguncian akun otomatis setelah mencapai batas login gagal (menit)",
  },
  {
    key: "sessionTtlHours",
    category: "SECURITY_AUTH",
    value: "24",
    valueType: "number",
    description: "Masa berlaku sesi aktif login dasbor admin (jam)",
  },
  {
    key: "requireEmailVerification",
    category: "SECURITY_AUTH",
    value: "true",
    valueType: "boolean",
    description: "Wajibkan verifikasi email sebelum akun baru dapat digunakan",
  },

  // RETENTION_AUDIT
  {
    key: "validationLogRetentionDays",
    category: "RETENTION_AUDIT",
    value: "180",
    valueType: "number",
    description: "Masa retensi penyimpanan log validasi mesin license_validation_logs (hari)",
  },
  {
    key: "updateLogRetentionDays",
    category: "RETENTION_AUDIT",
    value: "90",
    valueType: "number",
    description: "Masa retensi penyimpanan log telemetri auto-updater engine_update_logs (hari)",
  },
];
