import { describe, expect, it } from "vitest";
import { type AuthContext, canAccess, canAccessApi, canAccessRoute } from "@/security/fieldGuard";

describe("fieldGuard (Triple A Pattern)", () => {
  describe("canAccess", () => {
    it("should allow access for valid role or permission", () => {
      // Arrange
      const role = "ADMIN";

      // Act
      const result = canAccess(role);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("canAccessRoute", () => {
    it("should allow ADMIN to access protected route", () => {
      // Arrange
      const auth: AuthContext = {
        userId: "usr-admin-1",
        role: "ADMIN",
        licenseKey: "AKSA-KEY-999",
      };
      const pathname = "/dashboard/settings";

      // Act
      const result = canAccessRoute(auth, pathname);

      // Assert
      expect(result).toBe(true);
    });

    it("should deny access when auth context is missing userId", () => {
      // Arrange
      const auth = {
        userId: "",
        role: "ADMIN",
      } as unknown as AuthContext;
      const pathname = "/dashboard";

      // Act
      const result = canAccessRoute(auth, pathname);

      // Assert
      expect(result).toBe(false);
    });

    it("should deny access when user role is not ADMIN", () => {
      // Arrange
      const auth = {
        userId: "usr-guest-1",
        role: "GUEST" as unknown as AuthContext["role"],
      };
      const pathname = "/dashboard";

      // Act
      const result = canAccessRoute(auth, pathname);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("canAccessApi", () => {
    it("should allow ADMIN to access protected API route with method", () => {
      // Arrange
      const auth: AuthContext = {
        userId: "usr-admin-1",
        role: "ADMIN",
      };
      const pathname = "/api/users";
      const method = "POST";

      // Act
      const result = canAccessApi(auth, pathname, method);

      // Assert
      expect(result).toBe(true);
    });

    it("should deny API access when auth is undefined or null", () => {
      // Arrange
      const auth = null as unknown as AuthContext;
      const pathname = "/api/data";

      // Act
      const result = canAccessApi(auth, pathname, "GET");

      // Assert
      expect(result).toBe(false);
    });
  });
});
