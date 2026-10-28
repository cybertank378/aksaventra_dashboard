import type { AuthContext } from "@/security/fieldGuard";

export interface PolicyEvaluationParams {
  path: string;
  method?: string;
  auth: AuthContext;
}

/**
 * Policy evaluator for Aksaventra Engine Dashboard & Validation System.
 * - Pembuatan dan manajemen lisensi engine HANYA diizinkan untuk ADMIN.
 * - Akses rute engine audit & management memerlukan kredensial valid.
 */
export function evaluatePolicy({ path, method: _method, auth }: PolicyEvaluationParams): boolean {
  if (!auth || !auth.userId) {
    return false;
  }

  // Pembuatan dan pengelolaan lisensi engine HANYA boleh dilakukan oleh ADMIN
  const isLicenseManagementRoute =
    path.startsWith("/api/licenses") ||
    path.startsWith("/api/v1/licenses") ||
    path.startsWith("/dashboard/licenses");

  if (isLicenseManagementRoute) {
    return auth.role === "ADMIN";
  }

  // Administrator memiliki hak akses penuh ke seluruh rute dashboard dan engine management
  if (auth.role === "ADMIN") {
    return true;
  }

  // Akses rute engine management lainnya
  if (path.startsWith("/api/v1/engine") && !auth.engineAccess && !auth.licenseKey) {
    return false;
  }

  return true;
}
