import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordUseCase } from "@/modules/auth/application/usecase/ForgotPasswordUseCase";
import { ResetPasswordUseCase } from "@/modules/auth/application/usecase/ResetPasswordUseCase";
import { PasswordResetTokenEntity } from "@/modules/auth/domain/entity/PasswordResetTokenEntity";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockMailProvider,
  createMockPasswordHasher,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("Password Reset Use Cases (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockMail: ReturnType<typeof createMockMailProvider>;
  let mockHasher: ReturnType<typeof createMockPasswordHasher>;
  let forgotPasswordUseCase: ForgotPasswordUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockMail = createMockMailProvider();
    mockHasher = createMockPasswordHasher();
    forgotPasswordUseCase = new ForgotPasswordUseCase(mockRepo, mockMail);
    resetPasswordUseCase = new ResetPasswordUseCase(mockRepo, mockHasher);
  });

  describe("ForgotPasswordUseCase", () => {
    it("should generate reset token and send email when user exists", async () => {
      // Arrange
      const email = "admin@aksaventra.com";
      const user = UserCredentialEntity.create({
        id: "usr-1",
        email,
        passwordHash: "hash",
        role: "ADMIN",
        isActive: true,
      });
      vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(user);

      // Act
      const result = await forgotPasswordUseCase.execute({ email });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().success).toBe(true);
      expect(mockRepo.savePasswordResetToken).toHaveBeenCalled();
      expect(mockMail.sendMail).toHaveBeenCalled();
    });

    it("should return ok silently when user does not exist (anti-enumeration)", async () => {
      // Arrange
      vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(null);

      // Act
      const result = await forgotPasswordUseCase.execute({ email: "unknown@aksaventra.com" });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().success).toBe(true);
      expect(mockMail.sendMail).not.toHaveBeenCalled();
    });
  });

  describe("ResetPasswordUseCase", () => {
    it("should successfully reset password, mark token used, and revoke sessions", async () => {
      // Arrange
      const token = "valid_reset_token";
      const newPassword = "NewStrongPassword123!";
      const resetTokenEntity = PasswordResetTokenEntity.create({
        id: "rt-1",
        userId: "usr-1",
        token,
        expiresAt: new Date(Date.now() + 3600_000),
        isUsed: false,
      });
      const user = UserCredentialEntity.create({
        id: "usr-1",
        email: "admin@aksaventra.com",
        passwordHash: "old_hash",
        role: "ADMIN",
        isActive: true,
      });

      vi.mocked(mockRepo.findPasswordResetToken).mockResolvedValue(resetTokenEntity);
      vi.mocked(mockRepo.findUserById).mockResolvedValue(user);
      vi.mocked(mockHasher.hash).mockResolvedValue("new_hash");

      // Act
      const result = await resetPasswordUseCase.execute({ token, newPassword });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRepo.updateUser).toHaveBeenCalled();
      expect(mockRepo.savePasswordResetToken).toHaveBeenCalled();
      expect(mockRepo.deleteSessionsByUserId).toHaveBeenCalledWith("usr-1");
    });

    it("should fail when token is invalid or expired", async () => {
      // Arrange
      vi.mocked(mockRepo.findPasswordResetToken).mockResolvedValue(null);

      // Act
      const result = await resetPasswordUseCase.execute({
        token: "invalid_token",
        newPassword: "NewStrongPassword123!",
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe("Invalid or expired reset token");
    });

    it("should fail when new password does not meet policy", async () => {
      // Arrange
      const token = "any_token";
      const weakPassword = "123";

      // Act
      const result = await resetPasswordUseCase.execute({
        token,
        newPassword: weakPassword,
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toContain("at least 8 characters");
    });
  });
});
