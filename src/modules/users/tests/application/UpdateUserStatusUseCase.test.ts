import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateUserStatusUseCase } from "@/modules/users/application/usecase/UpdateUserStatusUseCase";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { createMockUserRepository } from "@/modules/users/tests/mocks/mockUserFactories";

describe("UpdateUserStatusUseCase (Triple A Pattern)", () => {
  let mockRepo: UserRepositoryInterface;
  let useCase: UpdateUserStatusUseCase;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    useCase = new UpdateUserStatusUseCase(mockRepo);
  });

  it("should deactivate user and revoke active sessions", async () => {
    // Arrange
    const targetUser = ManagedUserEntity.create({
      id: "usr-operator-to-deactivate",
      name: "Operator Test",
      email: "operator@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(targetUser);
    vi.mocked(mockRepo.countActiveAdmins).mockResolvedValue(2);
    vi.mocked(mockRepo.updateStatusAndRevokeSessions).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      "usr-operator-to-deactivate",
      {
        isActive: false,
        reason: "Mutasi divisi",
      },
      "actor-admin-1",
      "127.0.0.1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const updated = result.getValue();
    expect(updated.isActive).toBe(false);
    expect(mockRepo.updateStatusAndRevokeSessions).toHaveBeenCalledWith(
      expect.anything(),
      true, // revokeSessions = true
      expect.objectContaining({
        action: "USER_STATUS_UPDATED",
      }),
    );
  });

  it("should unlock a locked user and reset failed attempts", async () => {
    // Arrange
    const lockedUser = ManagedUserEntity.create({
      id: "usr-locked",
      name: "Terkunci",
      email: "terkunci@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 3600000),
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(lockedUser);
    vi.mocked(mockRepo.updateStatusAndRevokeSessions).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      "usr-locked",
      {
        unlock: true,
        reason: "Buka kunci akun atas permintaan tiket IT",
      },
      "actor-admin-1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const updated = result.getValue();
    expect(updated.accountState).toBe("ACTIVE");
    expect(updated.lockedUntil).toBeNull();
  });
});
