import { beforeEach, describe, expect, it, vi } from "vitest";
import { SendVerificationUseCase } from "@/modules/auth/application/usecase/SendVerificationUseCase";
import { VerifyEmailUseCase } from "@/modules/auth/application/usecase/VerifyEmailUseCase";
import { EmailVerificationTokenEntity } from "@/modules/auth/domain/entity/EmailVerificationTokenEntity";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockMailProvider,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("Email Verification Use Cases (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockMail: ReturnType<typeof createMockMailProvider>;
  let sendUseCase: SendVerificationUseCase;
  let verifyUseCase: VerifyEmailUseCase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockMail = createMockMailProvider();
    sendUseCase = new SendVerificationUseCase(mockRepo, mockMail);
    verifyUseCase = new VerifyEmailUseCase(mockRepo);
  });

  describe("SendVerificationUseCase", () => {
    it("should generate email verification token and send verification email", async () => {
      // Arrange
      const userId = "usr-1";
      const user = UserCredentialEntity.create({
        id: userId,
        email: "user@aksaventra.com",
        passwordHash: "hash",
        role: "ADMIN",
        isActive: true,
      });
      vi.mocked(mockRepo.findUserById).mockResolvedValue(user);

      // Act
      const result = await sendUseCase.execute({ userId });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockRepo.saveEmailVerificationToken).toHaveBeenCalled();
      expect(mockMail.sendMail).toHaveBeenCalled();
    });

    it("should fail when user does not exist", async () => {
      // Arrange
      vi.mocked(mockRepo.findUserById).mockResolvedValue(null);

      // Act
      const result = await sendUseCase.execute({ userId: "unknown" });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe("User not found");
      expect(mockMail.sendMail).not.toHaveBeenCalled();
    });
  });

  describe("VerifyEmailUseCase", () => {
    it("should verify email and activate user when token is valid", async () => {
      // Arrange
      const token = "valid_verify_token";
      const tokenEntity = EmailVerificationTokenEntity.create({
        id: "vt-1",
        userId: "usr-1",
        token,
        expiresAt: new Date(Date.now() + 3600_000),
        isUsed: false,
      });
      const user = UserCredentialEntity.create({
        id: "usr-1",
        email: "user@aksaventra.com",
        passwordHash: "hash",
        role: "ADMIN",
        isActive: false,
      });

      vi.mocked(mockRepo.findEmailVerificationToken).mockResolvedValue(tokenEntity);
      vi.mocked(mockRepo.findUserById).mockResolvedValue(user);

      // Act
      const result = await verifyUseCase.execute({ token });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().success).toBe(true);
      expect(mockRepo.saveEmailVerificationToken).toHaveBeenCalled();
      expect(mockRepo.updateUser).toHaveBeenCalled();
      expect(user.isActive).toBe(true);
    });

    it("should fail when verification token is invalid or expired", async () => {
      // Arrange
      vi.mocked(mockRepo.findEmailVerificationToken).mockResolvedValue(null);

      // Act
      const result = await verifyUseCase.execute({ token: "invalid_token" });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe("Invalid or expired verification token");
    });
  });
});
