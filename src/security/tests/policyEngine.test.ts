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
      path: "/api/licenses/create",
      method: "POST",
      auth: adminAuth,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(true);
  });

  it("should deny non-ADMIN from accessing license generation routes", () => {
    // Arrange
    const operatorAuth: AuthContext = {
      userId: "usr-op-1",
      role: "OPERATOR" as unknown as AuthContext["role"],
    };
    const params = {
      path: "/api/licenses/create",
      method: "POST",
      auth: operatorAuth,
    };

    // Act
    const isAllowed = evaluatePolicy(params);

    // Assert
    expect(isAllowed).toBe(false);
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
