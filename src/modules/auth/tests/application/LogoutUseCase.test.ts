import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogoutAllUsecase } from "@/modules/auth/application/usecase/LogoutAllUsecase";
import { LogoutUseCase } from "@/modules/auth/application/usecase/LogoutUseCase";
import { createMockAuthRepository } from "@/modules/auth/tests/mocks/mockFactories";

describe("Logout Use Cases (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let logoutUseCase: LogoutUseCase;
  let logoutAllUseCase: LogoutAllUsecase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    logoutUseCase = new LogoutUseCase(mockRepo);
    logoutAllUseCase = new LogoutAllUsecase(mockRepo);
  });

  describe("LogoutUseCase", () => {
    it("should successfully delete session by token", async () => {
      // Arrange
      const token = "session-token-to-delete";
      vi.mocked(mockRepo.deleteSession).mockResolvedValue(true);

      // Act
      const result = await logoutUseCase.execute({ token });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().success).toBe(true);
      expect(mockRepo.deleteSession).toHaveBeenCalledWith(token);
    });
  });

  describe("LogoutAllUsecase", () => {
    it("should delete all active sessions for a user and return count", async () => {
      // Arrange
      const userId = "usr-123";
      vi.mocked(mockRepo.deleteSessionsByUserId).mockResolvedValue(3);

      // Act
      const result = await logoutAllUseCase.execute({ userId });

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().success).toBe(true);
      expect(mockRepo.deleteSessionsByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
