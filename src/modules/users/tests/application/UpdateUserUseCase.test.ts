import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateUserUseCase } from "@/modules/users/application/usecase/UpdateUserUseCase";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { createMockUserRepository } from "@/modules/users/tests/mocks/mockUserFactories";

describe("UpdateUserUseCase (Triple A Pattern)", () => {
  let mockRepo: UserRepositoryInterface;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    useCase = new UpdateUserUseCase(mockRepo);
  });

  it("should update user name and role, then record audit log", async () => {
    // Arrange
    const user = ManagedUserEntity.create({
      id: "usr-target",
      name: "Old Name",
      email: "user@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(user);
    vi.mocked(mockRepo.countActiveAdmins).mockResolvedValue(2);
    vi.mocked(mockRepo.update).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      "usr-target",
      {
        name: "New Name",
        role: "AUDITOR",
      },
      "actor-admin-1",
      "192.168.1.10",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const updated = result.getValue();
    expect(updated.name).toBe("New Name");
    expect(updated.role).toBe("AUDITOR");
    expect(mockRepo.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "actor-admin-1",
        action: "USER_UPDATED",
        target: "usr-target",
      }),
    );
  });

  it("should enforce SelfProtectionRule against self-demotion from ADMIN", async () => {
    // Arrange
    const adminUser = ManagedUserEntity.create({
      id: "admin-self",
      name: "Super Admin",
      email: "superadmin@aksaventra.com",
      role: "ADMIN",
      isActive: true,
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(adminUser);
    vi.mocked(mockRepo.countActiveAdmins).mockResolvedValue(2);

    // Act
    const result = await useCase.execute(
      "admin-self",
      {
        role: "OPERATOR",
      },
      "admin-self", // Actor demoting himself!
    );

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain(
      "tidak dapat menurunkan role Administrator Anda sendiri",
    );
  });
});
