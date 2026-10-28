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

  it("should allow OPERATOR to access operational license & monitor dashboard routes but deny admin routes", () => {
    // Arrange
    const operatorAuth: AuthContext = {
      userId: "usr-op-1",
      role: "OPERATOR",
    };

    // Act & Assert
    expect(evaluatePolicy({ path: "/dashboard/licenses", method: "GET", auth: operatorAuth })).toBe(
      true,
    );
    expect(
      evaluatePolicy({ path: "/dashboard/licenses/create", method: "GET", auth: operatorAuth }),
    ).toBe(true);
    expect(
      evaluatePolicy({ path: "/dashboard/licenses/devices", method: "GET", auth: operatorAuth }),
    ).toBe(true);
    expect(
      evaluatePolicy({
        path: "/dashboard/licenses/revocations",
        method: "GET",
        auth: operatorAuth,
      }),
    ).toBe(false);
    expect(evaluatePolicy({ path: "/dashboard/users", method: "GET", auth: operatorAuth })).toBe(
      false,
    );
    expect(evaluatePolicy({ path: "/dashboard/settings", method: "GET", auth: operatorAuth })).toBe(
      false,
    );
  });

  it("should allow AUDITOR read-only access to allowed audit & integrity routes and deny mutations", () => {
    // Arrange
    const auditorAuth: AuthContext = {
      userId: "usr-aud-1",
      role: "AUDITOR",
    };

    // Act & Assert
    expect(evaluatePolicy({ path: "/dashboard/licenses", method: "GET", auth: auditorAuth })).toBe(
      true,
    );
    expect(
      evaluatePolicy({ path: "/dashboard/engine/integrity", method: "GET", auth: auditorAuth }),
    ).toBe(true);
    expect(
      evaluatePolicy({ path: "/dashboard/logs/audit", method: "GET", auth: auditorAuth }),
    ).toBe(true);
    expect(
      evaluatePolicy({ path: "/dashboard/licenses/create", method: "GET", auth: auditorAuth }),
    ).toBe(false);
    expect(evaluatePolicy({ path: "/dashboard/licenses", method: "POST", auth: auditorAuth })).toBe(
      false,
    );
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
