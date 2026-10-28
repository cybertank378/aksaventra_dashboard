import { describe, expect, it } from "vitest";
import { EmailVerificationTokenEntity } from "@/modules/auth/domain/entity/EmailVerificationTokenEntity";
import { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import { PasswordResetTokenEntity } from "@/modules/auth/domain/entity/PasswordResetTokenEntity";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import { UserSessionEntity } from "@/modules/auth/domain/entity/UserSessionEntity";

describe("Domain Entities (Triple A Pattern)", () => {
  describe("UserCredentialEntity", () => {
    it("should create user credential entity with proper attributes", () => {
      // Arrange
      const id = "usr-1";
      const email = "admin@aksaventra.com";
      const passwordHash = "hashed_pass123";
      const name = "Admin User";
      const role = "ADMIN";
      const isActive = true;

      // Act
      const user = UserCredentialEntity.create({
        id,
        email,
        passwordHash,
        name,
        role,
        isActive,
      });

      // Assert
      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.role).toBe("ADMIN");
      expect(user.isActive).toBe(true);
      expect(user.name).toBe(name);
    });

    it("should handle activation and deactivation", () => {
      // Arrange
      const user = UserCredentialEntity.create({
        id: "usr-2",
        email: "test@aksaventra.com",
        passwordHash: "hash",
        role: "ADMIN",
        isActive: false,
      });

      // Act
      user.activate();
      const activeState = user.isActive;
      user.deactivate();
      const inactiveState = user.isActive;

      // Assert
      expect(activeState).toBe(true);
      expect(inactiveState).toBe(false);
    });

    it("should update password hash and record login timestamp", () => {
      // Arrange
      const user = UserCredentialEntity.create({
        id: "usr-4",
        email: "pass@aksaventra.com",
        passwordHash: "old_hash",
        role: "ADMIN",
        isActive: true,
      });
      const newHash = "new_hashed_password";

      // Act
      user.updatePassword(newHash);
      user.recordLogin();

      // Assert
      expect(user.passwordHash).toBe(newHash);
      expect(user.lastLoginAt).toBeDefined();
    });
  });

  describe("UserSessionEntity", () => {
    it("should determine if a session is active or expired", () => {
      // Arrange
      const activeSession = UserSessionEntity.create({
        id: "sess-1",
        userId: "usr-1",
        token: "token-1",
        expiresAt: new Date(Date.now() + 3600_000),
      });

      const expiredSession = UserSessionEntity.create({
        id: "sess-2",
        userId: "usr-1",
        token: "token-2",
        expiresAt: new Date(Date.now() - 1000),
      });

      // Act
      const activeStatus = activeSession.isExpired();
      const expiredStatus = expiredSession.isExpired();

      // Assert
      expect(activeStatus).toBe(false);
      expect(expiredStatus).toBe(true);
    });

    it("should expire session immediately with expireNow", () => {
      // Arrange
      const session = UserSessionEntity.create({
        id: "sess-3",
        userId: "usr-1",
        token: "token-3",
        expiresAt: new Date(Date.now() + 3600_000),
      });

      // Act
      session.expireNow();

      // Assert
      expect(session.isExpired()).toBe(true);
    });
  });

  describe("LoginAuditEntity", () => {
    it("should create login audit record with expected properties", () => {
      // Arrange
      const id = "audit-1";
      const userId = "usr-1";
      const action = "LOGIN_FAILED";
      const details = "Incorrect password attempt";
      const ipAddress = "127.0.0.1";

      // Act
      const audit = LoginAuditEntity.create({
        id,
        userId,
        action,
        details,
        ipAddress,
      });

      // Assert
      expect(audit.id).toBe(id);
      expect(audit.userId).toBe(userId);
      expect(audit.action).toBe(action);
      expect(audit.details).toBe(details);
      expect(audit.ipAddress).toBe(ipAddress);
    });
  });

  describe("EmailVerificationTokenEntity & PasswordResetTokenEntity", () => {
    it("should handle email verification token validity and markAsUsed", () => {
      // Arrange
      const token = EmailVerificationTokenEntity.create({
        id: "vt-1",
        userId: "usr-1",
        token: "verify-token-123",
        expiresAt: new Date(Date.now() + 600_000),
        isUsed: false,
      });

      // Act
      const isInitiallyValid = token.isValid();
      token.markAsUsed();
      const isValidAfterUsed = token.isValid();

      // Assert
      expect(isInitiallyValid).toBe(true);
      expect(token.isUsed).toBe(true);
      expect(isValidAfterUsed).toBe(false);
    });

    it("should handle password reset token validity and markAsUsed", () => {
      // Arrange
      const token = PasswordResetTokenEntity.create({
        id: "rt-1",
        userId: "usr-1",
        token: "reset-token-123",
        expiresAt: new Date(Date.now() + 600_000),
        isUsed: false,
      });

      // Act
      const isInitiallyValid = token.isValid();
      token.markAsUsed();
      const isValidAfterUsed = token.isValid();

      // Assert
      expect(isInitiallyValid).toBe(true);
      expect(token.isUsed).toBe(true);
      expect(isValidAfterUsed).toBe(false);
    });
  });
});
