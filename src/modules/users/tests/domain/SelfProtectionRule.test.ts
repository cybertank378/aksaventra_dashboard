import { describe, expect, it } from "vitest";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import { SelfProtectionRule } from "@/modules/users/domain/rules/SelfProtectionRule";

describe("SelfProtectionRule (Triple A Pattern)", () => {
  it("should deny an admin from deactivating their own account", () => {
    // Arrange
    const adminUser = ManagedUserEntity.create({
      id: "admin-self-1",
      email: "admin@aksaventra.com",
      role: "ADMIN",
      isActive: true,
    });

    // Act
    const evaluation = SelfProtectionRule.validateStatusChange(
      "admin-self-1",
      adminUser,
      false, // newIsActive
      2, // totalActiveAdmins
    );

    // Assert
    expect(evaluation.isAllowed).toBe(false);
    expect(evaluation.reason).toContain(
      "tidak dapat menonaktifkan akun Administrator Anda sendiri",
    );
  });

  it("should deny deactivating an admin if they are the only remaining active admin", () => {
    // Arrange
    const adminUser = ManagedUserEntity.create({
      id: "admin-other-2",
      email: "sole-admin@aksaventra.com",
      role: "ADMIN",
      isActive: true,
    });

    // Act
    const evaluation = SelfProtectionRule.validateStatusChange(
      "actor-root",
      adminUser,
      false,
      1, // only 1 active admin left!
    );

    // Assert
    expect(evaluation.isAllowed).toBe(false);
    expect(evaluation.reason).toContain("minimal 1 Administrator aktif");
  });

  it("should deny an admin from demoting their own role to OPERATOR or AUDITOR", () => {
    // Arrange
    const adminUser = ManagedUserEntity.create({
      id: "admin-self-1",
      email: "admin@aksaventra.com",
      role: "ADMIN",
      isActive: true,
    });

    // Act
    const evaluation = SelfProtectionRule.validateRoleChange(
      "admin-self-1",
      adminUser,
      "OPERATOR",
      3,
    );

    // Assert
    expect(evaluation.isAllowed).toBe(false);
    expect(evaluation.reason).toContain("tidak dapat menurunkan role Administrator Anda sendiri");
  });

  it("should allow modifying non-admin users or other admin when multiple admins exist", () => {
    // Arrange
    const operatorUser = ManagedUserEntity.create({
      id: "operator-1",
      email: "op@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
    });

    // Act
    const statusEval = SelfProtectionRule.validateStatusChange("admin-1", operatorUser, false, 2);
    const roleEval = SelfProtectionRule.validateRoleChange("admin-1", operatorUser, "AUDITOR", 2);

    // Assert
    expect(statusEval.isAllowed).toBe(true);
    expect(roleEval.isAllowed).toBe(true);
  });
});
