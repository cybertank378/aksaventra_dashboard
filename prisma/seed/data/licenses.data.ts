import type { LicenseStatus } from "@prisma/client";

export interface LicenseSeedData {
  serialKey: string;
  clientName: string;
  hwid?: string | null;
  vaultSecret: string;
  status: LicenseStatus;
  engineVersion: string | null;
  expiresInDays: number;
  createdDaysAgo?: number;
  activatedDaysAgo?: number;
}

/**
 * Daftar statis lisensi awal untuk pengujian analitik dasbor dan validasi engine.
 * Seluruh tier lisensi diseragamkan ke TRIAL dan engineVersion ke v2.2.3 (tanpa penguncian HWID).
 */
export const LICENSE_SEED_ITEMS: readonly LicenseSeedData[] = [
  {
    serialKey: "AKSA-TRIAL-2026-365DY",
    clientName: "PT Graha Finansial Mandiri",
    vaultSecret: "AKSA_VAULT_SECRET_365DY",
    status: "ACTIVE",
    engineVersion: "v2.2.3",
    expiresInDays: 365,
    createdDaysAgo: 0,
    activatedDaysAgo: 0,
  },
];
