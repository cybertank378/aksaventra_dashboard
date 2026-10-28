import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginUseCase } from "@/modules/auth/application/usecase/LoginUseCase";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockPasswordHasher,
  createMockTokenProvider,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("LoginUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockHasher: ReturnType<typeof createMockPasswordHasher>;
  let mockTokenProvider: ReturnType<typeof createMockTokenProvider>;
  let useCase: LoginUseCase;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockHasher = createMockPasswordHasher();
    mockTokenProvider = createMockTokenProvider();
    useCase = new LoginUseCase(mockRepo, mockHasher, mockTokenProvider);
  });

  it("should successfully login user with correct credentials and return tokens", async () => {
    // Arrange
    const email = "admin@aksaventra.com";
    const password = "Password123!";
    const existingUser = UserCredentialEntity.create({
      id: "usr-1",
      email,
      passwordHash: `hashed_${password}`,
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
    });

    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(existingUser);
    vi.mocked(mockHasher.compare).mockResolvedValue(true);
    vi.mocked(mockTokenProvider.signAccessToken).mockResolvedValue("access-jwt-token");
    vi.mocked(mockTokenProvider.signRefreshToken).mockResolvedValue("refresh-jwt-token");

    // Act
    const result = await useCase.execute({
      email,
      password,
      ipAddress: "127.0.0.1",
      userAgent: "Vitest Browser",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.user.email).toBe(email);
    expect(data.tokens.accessToken).toBe("access-jwt-token");
    expect(data.tokens.refreshToken).toBe("refresh-jwt-token");
    expect(mockRepo.updateUser).toHaveBeenCalled();
    expect(mockRepo.createSession).toHaveBeenCalled();
    expect(mockRepo.createLoginAudit).toHaveBeenCalled();
  });

  it("should fail login when user does not exist and record failed audit", async () => {
    // Arrange
    const email = "notfound@aksaventra.com";
    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(null);

    // Act
    const result = await useCase.execute({
      email,
      password: "AnyPassword123!",
      ipAddress: "127.0.0.1",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Invalid email or password");
    expect(mockRepo.createLoginAudit).toHaveBeenCalled();
    expect(mockRepo.createSession).not.toHaveBeenCalled();
  });

  it("should fail login when account is deactivated", async () => {
    // Arrange
    const email = "inactive@aksaventra.com";
    const inactiveUser = UserCredentialEntity.create({
      id: "usr-inactive",
      email,
      passwordHash: "hashed_pass",
      role: "ADMIN",
      isActive: false,
    });
    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(inactiveUser);

    // Act
    const result = await useCase.execute({
      email,
      password: "Password123!",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Account is deactivated");
    expect(mockRepo.createSession).not.toHaveBeenCalled();
  });

  it("should fail login when password is incorrect and record audit", async () => {
    // Arrange
    const email = "admin@aksaventra.com";
    const existingUser = UserCredentialEntity.create({
      id: "usr-1",
      email,
      passwordHash: "correct_hashed_pass",
      role: "ADMIN",
      isActive: true,
    });
    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(existingUser);
    vi.mocked(mockHasher.compare).mockResolvedValue(false);

    // Act
    const result = await useCase.execute({
      email,
      password: "WrongPassword!",
      ipAddress: "127.0.0.1",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError()).toBe("Invalid email or password");
    expect(mockRepo.createLoginAudit).toHaveBeenCalled();
    expect(mockRepo.createSession).not.toHaveBeenCalled();
  });
});
