import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterUseCase } from "@/modules/auth/application/usecase/RegisterUseCase";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockPasswordHasher,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("RegisterUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockHasher: ReturnType<typeof createMockPasswordHasher>;
  let useCase: RegisterUseCase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockHasher = createMockPasswordHasher();
    useCase = new RegisterUseCase(mockRepo, mockHasher);
  });

  it("should successfully register a new user and return AuthUserResponseDTO", async () => {
    // Arrange
    const email = "newadmin@aksaventra.com";
    const password = "StrongPassword123!";
    const name = "New Admin";

    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(null);
    vi.mocked(mockHasher.hash).mockResolvedValue("hashed_StrongPassword123!");
    vi.mocked(mockRepo.saveUser).mockImplementation(async (user) => user);

    // Act
    const result = await useCase.execute({ email, password, name });

    // Assert
    expect(result.isSuccess).toBe(true);
    const registeredUser = result.getValue();
    expect(registeredUser.email).toBe(email);
    expect(registeredUser.name).toBe(name);
    expect(registeredUser.role).toBe("ADMIN");
    expect(mockRepo.saveUser).toHaveBeenCalled();
  });

  it("should fail when email format is invalid", async () => {
    // Arrange
    const invalidEmail = "not-an-email";
    const password = "StrongPassword123!";

    // Act
    const result = await useCase.execute({ email: invalidEmail, password });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toContain("valid email address");
    expect(mockRepo.saveUser).not.toHaveBeenCalled();
  });

  it("should fail when password does not meet policy requirements", async () => {
    // Arrange
    const email = "valid@aksaventra.com";
    const weakPassword = "123";

    // Act
    const result = await useCase.execute({ email, password: weakPassword });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toContain("at least 8 characters");
    expect(mockRepo.saveUser).not.toHaveBeenCalled();
  });

  it("should fail when email is already registered", async () => {
    // Arrange
    const email = "existing@aksaventra.com";
    const password = "StrongPassword123!";
    const existingUser = UserCredentialEntity.create({
      id: "usr-exist",
      email,
      passwordHash: "hash",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(existingUser);

    // Act
    const result = await useCase.execute({ email, password });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Email already registered");
    expect(mockRepo.saveUser).not.toHaveBeenCalled();
  });
});
