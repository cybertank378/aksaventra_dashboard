import { beforeEach, describe, expect, it, vi } from "vitest";
import { RevokeUserSessionsUseCase } from "@/modules/users/application/usecase/RevokeUserSessionsUseCase";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { createMockUserRepository } from "@/modules/users/tests/mocks/mockUserFactories";

describe("RevokeUserSessionsUseCase (Triple A Pattern)", () => {
  let mockRepo: UserRepositoryInterface;
  let useCase: RevokeUserSessionsUseCase;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    useCase = new RevokeUserSessionsUseCase(mockRepo);
  });

  it("should revoke all sessions for given user and record audit log", async () => {
    // Arrange
    const targetUser = ManagedUserEntity.create({
      id: "usr-compromised",
      email: "user@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(targetUser);
    vi.mocked(mockRepo.revokeAllSessions).mockResolvedValue(4);

    // Act
    const result = await useCase.execute("usr-compromised", "actor-admin-1", "10.0.0.1");

    // Assert
    expect(result.isSuccess).toBe(true);
    const res = result.getValue();
    expect(res.revokedSessionsCount).toBe(4);
    expect(mockRepo.revokeAllSessions).toHaveBeenCalledWith(
      "usr-compromised",
      expect.objectContaining({
        userId: "actor-admin-1",
        action: "USER_SESSIONS_REVOKED",
        target: "usr-compromised",
      }),
    );
  });
});
