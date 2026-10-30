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

  // API pembuatan dan pengelolaan lisensi engine berdasarkan matriks RBAC
  if (path.startsWith("/api/v1/licenses")) {
    if (normalizedMethod === "GET") {
      return canAccess(auth.role, "LICENSES_VIEW");
    }

    // Legacy direct route guard /api/v1/licenses/create HANYA untuk ADMIN
    if (path.startsWith("/api/v1/licenses/create")) {
      return auth.role === "ADMIN";
    }

    if (path.includes("/reset-hwid")) {
      return canAccess(auth.role, "LICENSES_MANAGE");
    }

    if (path.includes("/status")) {
      return canAccess(auth.role, "LICENSES_REVOKE");
    }

    if (path === "/api/v1/licenses" && normalizedMethod === "POST") {
      return canAccess(auth.role, "LICENSES_CREATE");
    }

    return auth.role === "ADMIN";
  }

  // Administrator memiliki hak akses penuh ke seluruh rute dashboard dan engine management
  if (auth.role === "ADMIN") {
    return true;
  }

  // AUDITOR dan CLIENT hanya memiliki akses Read-Only (GET), kecuali kueri simulasi verifikasi biner (POST /api/v1/engine/integrity/verify)
  const isIntegrityVerifyPost =
    normalizedMethod === "POST" && path === "/api/v1/engine/integrity/verify";

  if (
    (auth.role === "AUDITOR" || auth.role === "CLIENT") &&
    normalizedMethod !== "GET" &&
    !(auth.role === "AUDITOR" && isIntegrityVerifyPost)
  ) {
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

  // Rute Dashboard Engine & Validasi
  if (path.startsWith("/dashboard/engine/monitor")) {
    return auth.role === "OPERATOR" && canAccess(auth.role, "ENGINE_VALIDATE");
  }

  if (path.startsWith("/dashboard/engine/integrity")) {
    return canAccess(auth.role, "ENGINE_VALIDATE");
  }

  if (path.startsWith("/dashboard/engine")) {
    return canAccess(auth.role, "ENGINE_VALIDATE");
  }

  // API Engine Integrity Status Update (HANYA ADMIN / ENGINE_REVOKE via PATCH)
  if (path.startsWith("/api/v1/engine/integrity") && path.endsWith("/status")) {
    if (normalizedMethod === "PATCH") {
      return canAccess(auth.role, "ENGINE_REVOKE");
    }
    return false;
  }

  // API Engine Monitor & Integrity (ADMIN, OPERATOR, AUDITOR via ENGINE_VALIDATE)
  if (path.startsWith("/api/v1/engine/monitor") || path.startsWith("/api/v1/engine/integrity")) {
    return canAccess(auth.role, "ENGINE_VALIDATE");
  }

  // Pruning log validasi hanya boleh dilakukan oleh ADMIN (role non-ADMIN ditolak)
  if (path.startsWith("/api/v1/logs/validations/prune")) {
    return false;
  }

  // Rute Audit & Logs
  if (path.startsWith("/dashboard/logs/audit")) {
    return auth.role === "AUDITOR" && canAccess(auth.role, "LOGS_VIEW");
  }

  if (path.startsWith("/dashboard/logs") || path.startsWith("/api/v1/logs")) {
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
