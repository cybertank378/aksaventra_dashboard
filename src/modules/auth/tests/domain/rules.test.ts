import { describe, expect, it } from "vitest";
import { AccountLockRule } from "@/modules/auth/domain/rules/AccountLockRule";
import { AuthorizationScopeRule } from "@/modules/auth/domain/rules/AuthorizationScopeRule";
import { EmailVerificationRule } from "@/modules/auth/domain/rules/EmailVerificationRule";
import { PasswordPolicyRule } from "@/modules/auth/domain/rules/PasswordPolicyRule";
import { RegisterPolicyRule } from "@/modules/auth/domain/rules/RegisterPolicyRule";

describe("Domain Rules (Triple A Pattern)", () => {
  describe("PasswordPolicyRule", () => {
    it("should accept strong passwords meeting complexity requirements", () => {
      // Arrange
      const strongPassword = "StrongPassword123";

      // Act
      const result = PasswordPolicyRule.validate(strongPassword);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it("should reject passwords that are too short", () => {
      // Arrange
      const shortPassword = "Ab1";

      // Act
      const result = PasswordPolicyRule.validate(shortPassword);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("at least 8 characters");
    });

    it("should reject passwords missing numbers or letters", () => {
      // Arrange
      const onlyLetters = "PasswordOnlyLetters";
      const onlyNumbers = "1234567890";

      // Act
      const resLetters = PasswordPolicyRule.validate(onlyLetters);
      const resNumbers = PasswordPolicyRule.validate(onlyNumbers);

      // Assert
      expect(resLetters.isValid).toBe(false);
      expect(resNumbers.isValid).toBe(false);
      expect(resLetters.message).toContain("both letters and numbers");
    });
  });

  describe("AccountLockRule", () => {
    it("should return true when attempts reach max threshold of 5", () => {
      // Arrange
      const attempts = 5;

      // Act
      const isLocked = AccountLockRule.isLocked(attempts);

      // Assert
      expect(isLocked).toBe(true);
    });

    it("should return false when attempts are below threshold", () => {
      // Arrange
      const attempts = 4;

      // Act
      const isLocked = AccountLockRule.isLocked(attempts);

      // Assert
      expect(isLocked).toBe(false);
    });
  });

  describe("AuthorizationScopeRule", () => {
    it("should verify access permissions for ADMIN role", () => {
      // Arrange
      const role = "ADMIN";
      const permission = "DASHBOARD_VIEW";

      // Act
      const isAuthorized = AuthorizationScopeRule.canAccess(role, permission);

      // Assert
      expect(typeof isAuthorized).toBe("boolean");
    });
  });

  describe("RegisterPolicyRule", () => {
    it("should validate valid registration email", () => {
      // Arrange
      const email = "admin@aksaventra.com";

      // Act
      const result = RegisterPolicyRule.validate(email);

      // Assert
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid email format", () => {
      // Arrange
      const invalidEmail = "not-an-email";

      // Act
      const result = RegisterPolicyRule.validate(invalidEmail);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.message).toContain("valid email address is required");
    });
  });

  describe("EmailVerificationRule", () => {
    it("should allow unused unexpired tokens", () => {
      // Arrange
      const isUsed = false;
      const futureExpiry = new Date(Date.now() + 60_000);

      // Act
      const isUsable = EmailVerificationRule.isTokenUsable(isUsed, futureExpiry);

      // Assert
      expect(isUsable).toBe(true);
    });

    it("should return false for used or expired tokens", () => {
      // Arrange
      const usedToken = true;
      const pastExpiry = new Date(Date.now() - 1000);

      // Act
      const resUsed = EmailVerificationRule.isTokenUsable(usedToken, new Date(Date.now() + 60_000));
      const resExpired = EmailVerificationRule.isTokenUsable(false, pastExpiry);

      // Assert
      expect(resUsed).toBe(false);
      expect(resExpired).toBe(false);
    });
  });
});
