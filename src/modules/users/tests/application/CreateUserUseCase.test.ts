import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import { CreateUserUseCase } from "@/modules/users/application/usecase/CreateUserUseCase";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import {
  createMockPasswordHasher,
  createMockUserRepository,
} from "@/modules/users/tests/mocks/mockUserFactories";

describe("CreateUserUseCase (Triple A Pattern)", () => {
  let mockRepo: UserRepositoryInterface;
  let mockHasher: PasswordHasherInterface;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    mockRepo = createMockUserRepository();
    mockHasher = createMockPasswordHasher();
    useCase = new CreateUserUseCase(mockRepo, mockHasher);
  });

  it("should create user, hash password, and record audit log", async () => {
    // Arrange
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockHasher.hash).mockResolvedValue("argon_hashed_secure_pass");
    vi.mocked(mockRepo.save).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      {
        name: "Siti Rahma",
        email: "siti@aksaventra.com",
        password: "SecretPassword123!",
        role: "OPERATOR",
      },
      "actor-admin-1",
      "127.0.0.1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const created = result.getValue();
    expect(created.name).toBe("Siti Rahma");
    expect(created.email).toBe("siti@aksaventra.com");
    expect(created.role).toBe("OPERATOR");
    expect(mockHasher.hash).toHaveBeenCalledWith("SecretPassword123!");
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.anything(),
      "argon_hashed_secure_pass",
      expect.objectContaining({
        userId: "actor-admin-1",
        action: "USER_CREATED",
      }),
    );
  });

  it("should fail if email is already taken", async () => {
    // Arrange
    const existing = ManagedUserEntity.create({
      id: "usr-exist",
      email: "duplicate@aksaventra.com",
      role: "OPERATOR",
      isActive: true,
    });
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(existing);

    // Act
    const result = await useCase.execute({
      name: "Duplicate User",
      email: "duplicate@aksaventra.com",
      password: "password123",
      role: "AUDITOR",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain("sudah terdaftar");
  });
});
