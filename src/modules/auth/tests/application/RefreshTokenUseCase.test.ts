import { beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshTokenUseCase } from "@/modules/auth/application/usecase/RefreshTokenUseCase";
import { ValidateAccessTokenUseCase } from "@/modules/auth/application/usecase/ValidateAccessTokenUseCase";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockTokenProvider,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("Token Validation & Refresh Use Cases (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockTokenProvider: ReturnType<typeof createMockTokenProvider>;
  let refreshUseCase: RefreshTokenUseCase;
  let validateUseCase: ValidateAccessTokenUseCase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockTokenProvider = createMockTokenProvider();
    refreshUseCase = new RefreshTokenUseCase(mockRepo, mockTokenProvider);
    validateUseCase = new ValidateAccessTokenUseCase(mockTokenProvider);
  });

  describe("ValidateAccessTokenUseCase", () => {
    it("should return payload when token is valid", async () => {
      // Arrange
      const token = "valid_access_token";
      vi.mocked(mockTokenProvider.verifyToken).mockResolvedValue({
        sub: "usr-1",
        email: "admin@aksaventra.com",
        role: "ADMIN",
      });

      // Act
      const result = await validateUseCase.execute({ token });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe("usr-1");
    });

    it("should return failure when token is invalid or expired", async () => {
      // Arrange
      const token = "expired_token";
      vi.mocked(mockTokenProvider.verifyToken).mockResolvedValue(null);

      // Act
      const result = await validateUseCase.execute({ token });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe("Invalid or expired token");
    });
  });

  describe("RefreshTokenUseCase", () => {
    it("should generate and return new tokens when refresh token is valid", async () => {
      // Arrange
      const refreshToken = "valid_refresh_token";
      const user = UserCredentialEntity.create({
        id: "usr-1",
        email: "admin@aksaventra.com",
        passwordHash: "hash",
        role: "ADMIN",
        isActive: true,
      });

      vi.mocked(mockTokenProvider.verifyToken).mockResolvedValue({
        sub: "usr-1",
        email: "admin@aksaventra.com",
        role: "ADMIN",
      });
      vi.mocked(mockRepo.findUserById).mockResolvedValue(user);
      vi.mocked(mockTokenProvider.signAccessToken).mockResolvedValue("new_access_token");
      vi.mocked(mockTokenProvider.signRefreshToken).mockResolvedValue("new_refresh_token");

      // Act
      const result = await refreshUseCase.execute({ refreshToken });

      // Assert
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.tokens.accessToken).toBe("new_access_token");
      expect(data.tokens.refreshToken).toBe("new_refresh_token");
    });

    it("should fail when refresh token cannot be verified", async () => {
      // Arrange
      vi.mocked(mockTokenProvider.verifyToken).mockResolvedValue(null);

      // Act
      const result = await refreshUseCase.execute({ refreshToken: "bad_token" });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe("Invalid or expired refresh token");
    });

    it("should fail when user no longer exists or is inactive", async () => {
      // Arrange
      vi.mocked(mockTokenProvider.verifyToken).mockResolvedValue({
        sub: "usr-inactive",
        email: "admin@aksaventra.com",
        role: "ADMIN",
      });
      vi.mocked(mockRepo.findUserById).mockResolvedValue(null);

      // Act
      const result = await refreshUseCase.execute({ refreshToken: "valid_token" });

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.getError()).toBe("User inactive or no longer exists");
    });
  });
});
