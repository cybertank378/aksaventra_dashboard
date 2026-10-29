import { type AuthContext, canAccess } from "@/security/fieldGuard";
import { roleConfig } from "@/security/rbacConfig";

export interface PolicyEvaluationParams {
  path: string;
  method?: string;
  auth: AuthContext;
}

/**
 * Policy evaluator for Aksaventra Engine Dashboard & Validation System.
 * - Pembuatan dan manajemen API lisensi engine HANYA diizinkan untuk ADMIN.
 * - Evaluasi rute dashboard mengikuti matriks RBAC (ADMIN, OPERATOR, AUDITOR).
 */
export function evaluatePolicy({ path, method = "GET", auth }: PolicyEvaluationParams): boolean {
  if (!auth || !auth.userId || !auth.role || !(auth.role in roleConfig)) {
    return false;
  }

  const normalizedMethod = method.toUpperCase();

  // API pembuatan dan pengelolaan lisensi engine HANYA boleh dilakukan oleh ADMIN
  if (path.startsWith("/api/v1/licenses")) {
    return auth.role === "ADMIN";
  }

  // Administrator memiliki hak akses penuh ke seluruh rute dashboard dan engine management
  if (auth.role === "ADMIN") {
    return true;
  }

  // AUDITOR hanya memiliki akses Read-Only (GET)
  if (auth.role === "AUDITOR" && normalizedMethod !== "GET") {
    return false;
  }

  // API Dashboard
  if (path.startsWith("/api/v1/dashboard/activities")) {
    return canAccess(auth.role, "LOGS_VIEW");
  }

  if (path.startsWith("/api/v1/dashboard")) {
    return canAccess(auth.role, "DASHBOARD_VIEW");
  }

  // Rute Administrasi (Pengguna & Pengaturan) hanya untuk pemilik izin terkait (ADMIN)
  if (path.startsWith("/dashboard/users") || path.startsWith("/api/v1/users")) {
    return canAccess(auth.role, "USERS_MANAGE");
  }

  if (path.startsWith("/dashboard/settings") || path.startsWith("/api/v1/settings")) {
    return canAccess(auth.role, "SETTINGS_MANAGE");
  }

  // Rute Manajemen Lisensi pada Dashboard berdasarkan izin granular
  if (path.startsWith("/dashboard/licenses/revocations")) {
    return canAccess(auth.role, "LICENSES_REVOKE");
  }

  if (path.startsWith("/dashboard/licenses/create")) {
    return canAccess(auth.role, "LICENSES_CREATE");
  }

  if (path.startsWith("/dashboard/licenses/devices")) {
    return canAccess(auth.role, "LICENSES_MANAGE");
  }

  if (path.startsWith("/dashboard/licenses")) {
    return canAccess(auth.role, "LICENSES_VIEW");
  }

  // Rute Engine & Validasi
  if (path.startsWith("/dashboard/engine/monitor")) {
    return auth.role === "OPERATOR" && canAccess(auth.role, "ENGINE_VALIDATE");
  }

  if (path.startsWith("/dashboard/engine/integrity")) {
    return auth.role === "AUDITOR" && canAccess(auth.role, "ENGINE_VALIDATE");
  }

  if (path.startsWith("/dashboard/engine")) {
    return canAccess(auth.role, "ENGINE_VALIDATE");
  }

  // Rute Audit & Logs
  if (path.startsWith("/dashboard/logs/audit")) {
    return auth.role === "AUDITOR" && canAccess(auth.role, "LOGS_VIEW");
  }

  if (path.startsWith("/dashboard/logs")) {
    return canAccess(auth.role, "LOGS_VIEW");
  }

  // API pembuatan dan pengelolaan rilis biner engine
  if (path.startsWith("/api/v1/releases")) {
    if (normalizedMethod !== "GET") {
      return false;
    }
    return canAccess(auth.role, "ENGINE_VALIDATE");
  }

  // Akses rute API engine management lainnya
  if (path.startsWith("/api/v1/engine") && !auth.engineAccess && !auth.licenseKey) {
    return false;
  }

  return canAccess(auth.role, "DASHBOARD_VIEW");
}
