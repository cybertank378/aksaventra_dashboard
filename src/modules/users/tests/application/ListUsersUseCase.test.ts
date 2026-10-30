import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListUsersUseCase } from "@/modules/users/application/usecase/ListUsersUseCase";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { createMockUserRepository } from "@/modules/users/tests/mocks/mockUserFactories";

describe("ListUsersUseCase (Triple A Pattern)", () => {
  let mockRepo: UserRepositoryInterface;
  let useCase: ListUsersUseCase;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    useCase = new ListUsersUseCase(mockRepo);
  });

  it("should return paginated list of users with active sessions count", async () => {
    // Arrange
    const sampleUser = ManagedUserEntity.create({
      id: "usr-1",
      name: "Budi Santoso",
      email: "budi@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
    });

    const sessionCounts = new Map<string, number>();
    sessionCounts.set("usr-1", 3);

    vi.mocked(mockRepo.findManyPaginated).mockResolvedValue({
      users: [sampleUser],
      total: 1,
      sessionCounts,
    });

    // Act
    const result = await useCase.execute({ page: 1, limit: 10 });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.users).toHaveLength(1);
    expect(data.users[0].name).toBe("Budi Santoso");
    expect(data.users[0].role).toBe("OPERATOR");
    expect(data.users[0].activeSessionsCount).toBe(3);
    expect(data.pagination.total).toBe(1);
  });
});
