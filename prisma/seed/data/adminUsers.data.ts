import type { UserRole } from "@prisma/client";

export interface AdminSeedUserData {
  email: string;
  name: string;
  plainPassword: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * Daftar statis akun Administrator untuk inisialisasi database Aksaventra.
 */
export const ADMIN_SEED_USERS: readonly AdminSeedUserData[] = [
  {
    email: "admin@aksaventra.com",
    name: "Super Administrator Aksaventra",
    plainPassword: "Password123!",
    role: "ADMIN",
    isActive: true,
  },
];
