import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChangePasswordUsecase } from "@/modules/auth/application/usecase/ChangePasswordUsecase";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockPasswordHasher,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("ChangePasswordUsecase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockHasher: ReturnType<typeof createMockPasswordHasher>;
  let useCase: ChangePasswordUsecase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockHasher = createMockPasswordHasher();
    useCase = new ChangePasswordUsecase(mockRepo, mockHasher);
  });

  it("should change password successfully when old password matches and new password meets policy", async () => {
    // Arrange
    const userId = "usr-1";
    const oldPassword = "OldPassword123!";
    const newPassword = "NewStrongPassword456#";
    const user = UserCredentialEntity.create({
      id: userId,
      email: "user@aksaventra.com",
      passwordHash: "old_hashed_pass",
      role: "ADMIN",
      isActive: true,
    });

    vi.mocked(mockRepo.findUserById).mockResolvedValue(user);
    vi.mocked(mockHasher.compare).mockResolvedValue(true);
    vi.mocked(mockHasher.hash).mockResolvedValue("new_hashed_pass");
    vi.mocked(mockRepo.updateUser).mockImplementation(async (u) => u);

    // Act
    const result = await useCase.execute({
      userId,
      oldPassword,
      newPassword,
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().success).toBe(true);
    expect(mockRepo.updateUser).toHaveBeenCalled();
  });

  it("should fail when user is not found", async () => {
    // Arrange
    vi.mocked(mockRepo.findUserById).mockResolvedValue(null);

    // Act
    const result = await useCase.execute({
      userId: "non-existent",
      oldPassword: "old",
      newPassword: "NewPassword123!",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("User not found");
  });

  it("should fail when current password does not match", async () => {
    // Arrange
    const user = UserCredentialEntity.create({
      id: "usr-1",
      email: "user@aksaventra.com",
      passwordHash: "old_hashed_pass",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(mockRepo.findUserById).mockResolvedValue(user);
    vi.mocked(mockHasher.compare).mockResolvedValue(false);

    // Act
    const result = await useCase.execute({
      userId: "usr-1",
      oldPassword: "WrongOldPassword!",
      newPassword: "NewPassword123!",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Incorrect current password");
    expect(mockRepo.updateUser).not.toHaveBeenCalled();
  });

  it("should fail when new password does not meet password policy", async () => {
    // Arrange
    const user = UserCredentialEntity.create({
      id: "usr-1",
      email: "user@aksaventra.com",
      passwordHash: "old_hashed_pass",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(mockRepo.findUserById).mockResolvedValue(user);
    vi.mocked(mockHasher.compare).mockResolvedValue(true);

    // Act
    const result = await useCase.execute({
      userId: "usr-1",
      oldPassword: "OldPassword123!",
      newPassword: "weak",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toContain("at least 8 characters");
    expect(mockRepo.updateUser).not.toHaveBeenCalled();
  });
});
