import type { UserRole } from "@/libs/enums";
import type { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";

export interface SelfProtectionEvaluationResult {
  isAllowed: boolean;
  reason?: string;
}

export class SelfProtectionRule {
  /**
   * Memvalidasi perubahan status aktif/nonaktif akun pengguna.
   */
  public static validateStatusChange(
    actorId: string | undefined,
    targetUser: ManagedUserEntity,
    newIsActive?: boolean,
    totalActiveAdmins?: number,
  ): SelfProtectionEvaluationResult {
    if (newIsActive === undefined || newIsActive === true) {
      return { isAllowed: true };
    }

    // 1. Larangan menonaktifkan akun sendiri
    if (actorId && actorId === targetUser.id) {
      return {
        isAllowed: false,
        reason: "Anda tidak dapat menonaktifkan akun Administrator Anda sendiri.",
      };
    }

    // 2. Proteksi minimal 1 administrator aktif dalam sistem
    if (targetUser.role === "ADMIN" && totalActiveAdmins !== undefined && totalActiveAdmins <= 1) {
      return {
        isAllowed: false,
        reason:
          "Tidak dapat menonaktifkan akun karena sistem membutuhkan minimal 1 Administrator aktif.",
      };
    }

    return { isAllowed: true };
  }

  /**
   * Memvalidasi perubahan role RBAC pengguna.
   */
  public static validateRoleChange(
    actorId: string | undefined,
    targetUser: ManagedUserEntity,
    newRole?: UserRole,
    totalActiveAdmins?: number,
  ): SelfProtectionEvaluationResult {
    if (!newRole || newRole === targetUser.role) {
      return { isAllowed: true };
    }

    // 1. Larangan menurunkan role diri sendiri dari ADMIN
    if (
      actorId &&
      actorId === targetUser.id &&
      targetUser.role === "ADMIN" &&
      newRole !== "ADMIN"
    ) {
      return {
        isAllowed: false,
        reason: "Anda tidak dapat menurunkan role Administrator Anda sendiri.",
      };
    }

    // 2. Proteksi minimal 1 administrator aktif dalam sistem
    if (
      targetUser.role === "ADMIN" &&
      newRole !== "ADMIN" &&
      totalActiveAdmins !== undefined &&
      totalActiveAdmins <= 1
    ) {
      return {
        isAllowed: false,
        reason:
          "Tidak dapat mengubah role karena sistem membutuhkan minimal 1 Administrator aktif.",
      };
    }

    return { isAllowed: true };
  }
}
