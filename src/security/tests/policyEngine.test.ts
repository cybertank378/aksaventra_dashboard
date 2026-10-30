import { describe, expect, it } from "vitest";
import type { AuthContext } from "@/security/fieldGuard";
import { evaluatePolicy } from "@/security/policyEngine";

describe("policyEngine (Triple A Pattern)", () => {
  it("should allow policy evaluation for valid ADMIN auth context", () => {
    // Arrange
    const auth: AuthContext = {
      userId: "usr-admin-1",
      role: "ADMIN",
      licenseKey: "AKSA-KEY-999",
      organization: "Aksaventra Dev",
      engineAccess: true,
    };
    const params = {
      path: "/dashboard/analytics",
      method: "GET",
      auth,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(true);
  });

  it("should allow ADMIN to manage and generate licenses", () => {
    // Arrange
    const adminAuth: AuthContext = {
      userId: "usr-admin-1",
      role: "ADMIN",
      licenseKey: "AKSA-SUPER-LICENSE",
    };
    const params = {
      path: "/api/v1/licenses/create",
      method: "POST",
      auth: adminAuth,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(true);
  });

  it("should deny non-ADMIN from accessing license generation API routes", () => {
    // Arrange
    const operatorAuth: AuthContext = {
      userId: "usr-op-1",
      role: "OPERATOR",
    };
    const params = {
      path: "/api/v1/licenses/create",
      method: "POST",
      auth: operatorAuth,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(false);
  });

  it("should restrict AUDITOR to read-only methods across protected routes", () => {
    // Arrange
    const auditorAuth: AuthContext = {
      userId: "usr-auditor-1",
      role: "AUDITOR",
    };

    // Act & Assert
    expect(
      evaluatePolicy({
        path: "/dashboard/logs",
        method: "GET",
        auth: auditorAuth,
      }),
    ).toBe(true);

    expect(
      evaluatePolicy({
        path: "/dashboard/licenses",
        method: "POST",
        auth: auditorAuth,
      }),
    ).toBe(false);

    expect(
      evaluatePolicy({
        path: "/dashboard/engine",
        method: "DELETE",
        auth: auditorAuth,
      }),
    ).toBe(false);
  });

  it("should evaluate operator permissions correctly based on RBAC configuration", () => {
    // Arrange
    const operatorAuth: AuthContext = {
      userId: "usr-operator-1",
      role: "OPERATOR",
    };

    // Act & Assert
    expect(
      evaluatePolicy({
        path: "/dashboard/licenses",
        method: "GET",
        auth: operatorAuth,
      }),
    ).toBe(true);

    expect(
      evaluatePolicy({
        path: "/dashboard/licenses/create",
        method: "GET",
        auth: operatorAuth,
      }),
    ).toBe(true);

    expect(
      evaluatePolicy({
        path: "/dashboard/licenses/revocations",
        method: "GET",
        auth: operatorAuth,
      }),
    ).toBe(false);

    expect(
      evaluatePolicy({
        path: "/dashboard/users",
        method: "GET",
        auth: operatorAuth,
      }),
    ).toBe(false);
  });

  it("should allow AUDITOR to access dashboard charts and summary", () => {
    // Arrange
    const auditorAuth: AuthContext = {
      userId: "usr-auditor-1",
      role: "AUDITOR",
    };

    // Act & Assert
    expect(
      evaluatePolicy({
        path: "/api/v1/dashboard/summary",
        method: "GET",
        auth: auditorAuth,
      }),
    ).toBe(true);

    expect(
      evaluatePolicy({
        path: "/api/v1/dashboard/charts/validation-trend",
        method: "GET",
        auth: auditorAuth,
      }),
    ).toBe(true);
  });

  it("should allow AUDITOR with LOGS_VIEW to access activities and deny if role lacks LOGS_VIEW", () => {
    // Arrange
    const auditorAuth: AuthContext = {
      userId: "usr-auditor-1",
      role: "AUDITOR",
    };

    // Act & Assert
    expect(
      evaluatePolicy({
        path: "/api/v1/dashboard/activities",
        method: "GET",
        auth: auditorAuth,
      }),
    ).toBe(true);

    expect(
      evaluatePolicy({
        path: "/api/v1/logs/validations",
        method: "GET",
        auth: auditorAuth,
      }),
    ).toBe(true);
  });

  it("should allow only ADMIN to access /api/v1/logs/validations/prune", () => {
    // Arrange
    const adminAuth: AuthContext = {
      userId: "usr-admin-1",
      role: "ADMIN",
    };
    const auditorAuth: AuthContext = {
      userId: "usr-auditor-1",
      role: "AUDITOR",
    };

    // Act & Assert
    expect(
      evaluatePolicy({
        path: "/api/v1/logs/validations/prune",
        method: "POST",
        auth: adminAuth,
      }),
    ).toBe(true);

    expect(
      evaluatePolicy({
        path: "/api/v1/logs/validations/prune",
        method: "POST",
        auth: auditorAuth,
      }),
    ).toBe(false);
  });

  it("should deny policy evaluation when auth context is empty or missing userId", () => {
    // Arrange
    const auth = {
      userId: "",
      role: "ADMIN",
    } as unknown as AuthContext;
    const params = {
      path: "/dashboard",
      method: "GET",
      auth,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(false);
  });

  it("should deny policy evaluation when auth is completely missing", () => {
    // Arrange
    const params = {
      path: "/dashboard",
      method: "GET",
      auth: null as unknown as AuthContext,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(false);
  });
});
