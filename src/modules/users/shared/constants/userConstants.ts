import type { UserRole } from "@/libs/enums";

export const DEFAULT_USER_PAGE_LIMIT = 10;

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN:
    "Akses penuh konfigurasi sistem, lisensi, registrasi engine, audit log, dan manajemen pengguna.",
  OPERATOR: "Operasional harian lisensi, pelepasan ikatan HWID perangkat, serta pemantauan engine.",
  AUDITOR:
    "Akses Read-Only untuk pemeriksaan kepatuhan lisensi, jejak audit forensik, dan analitik.",
};
