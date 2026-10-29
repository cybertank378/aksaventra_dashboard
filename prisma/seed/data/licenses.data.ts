import type { LicenseStatus } from "@prisma/client";

export interface LicenseSeedData {
  serialKey: string;
  clientName: string;
  hwid: string | null;
  vaultSecret: string;
  status: LicenseStatus;
  engineVersion: string | null;
  expiresInDays: number;
}

/**
 * Daftar statis lisensi awal untuk pengujian validasi engine (/api/v1/validate).
 * Catatan penting: HWID diset `null` saat lisensi diterbitkan, karena HWID dikirimkan oleh
 * payload klien `aksaventra_engine.exe` saat aktivasi pertama dan otomatis dikunci ke database.
 */
export const LICENSE_SEED_ITEMS: readonly LicenseSeedData[] = [
  {
    serialKey: "AKSA-ENTERPRISE-2026-9F2A",
    clientName: "PT Digital Nusantara",
    hwid: null,
    vaultSecret: "AKSA_VAULT_SECRET_ENT_9F2A_2026",
    status: "ACTIVE",
    engineVersion: null,
    expiresInDays: 365,
  },
  {
    serialKey: "AKSA-PRO-2026-4C8B",
    clientName: "CV Bintang Maritim",
    hwid: null,
    vaultSecret: "AKSA_VAULT_SECRET_PRO_4C8B_2026",
    status: "ACTIVE",
    engineVersion: null,
    expiresInDays: 14,
  },
  {
    serialKey: "AKSA-TRIAL-2026-1D5E",
    clientName: "Koperasi Sumber Rejeki",
    hwid: null,
    vaultSecret: "AKSA_VAULT_SECRET_TRIAL_1D5E_2026",
    status: "ACTIVE",
    engineVersion: null,
    expiresInDays: 30,
  },
  {
    serialKey: "AKSA-PRO-2025-8A1C",
    clientName: "PT Mitra Konstruksi",
    hwid: null,
    vaultSecret: "AKSA_VAULT_SECRET_PRO_8A1C_2025",
    status: "SUSPENDED",
    engineVersion: null,
    expiresInDays: -15,
  },
];
