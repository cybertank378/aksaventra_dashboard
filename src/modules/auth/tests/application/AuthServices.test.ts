import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthServices } from "@/modules/auth/application/services/AuthServices";
import { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import {
  createMockAuthRepository,
  createMockMailProvider,
  createMockPasswordHasher,
  createMockTokenProvider,
} from "@/modules/auth/tests/mocks/mockFactories";

describe("AuthServices Orchestrator (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;
  let mockHasher: ReturnType<typeof createMockPasswordHasher>;
  let mockTokenProvider: ReturnType<typeof createMockTokenProvider>;
  let mockMail: ReturnType<typeof createMockMailProvider>;
  let authServices: AuthServices;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
    mockHasher = createMockPasswordHasher();
    mockTokenProvider = createMockTokenProvider();
    mockMail = createMockMailProvider();
    authServices = new AuthServices(mockRepo, mockHasher, mockTokenProvider, mockMail);
  });

  it("should orchestrate login workflow through execute facade", async () => {
    // Arrange
    const email = "admin@aksaventra.com";
    const password = "Password123!";
    const user = UserCredentialEntity.create({
      id: "usr-1",
      email,
      passwordHash: "hash",
      role: "ADMIN",
      isActive: true,
    });

    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(user);
    vi.mocked(mockHasher.compare).mockResolvedValue(true);
    vi.mocked(mockTokenProvider.signAccessToken).mockResolvedValue("acc_token");
    vi.mocked(mockTokenProvider.signRefreshToken).mockResolvedValue("ref_token");

    // Act
    const result = await authServices.login({ email, password });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().tokens.accessToken).toBe("acc_token");
    expect(mockRepo.createSession).toHaveBeenCalled();
  });

  it("should orchestrate register workflow through execute facade", async () => {
    // Arrange
    const email = "new@aksaventra.com";
    const password = "StrongPassword123!";
    vi.mocked(mockRepo.findUserByEmail).mockResolvedValue(null);
    vi.mocked(mockHasher.hash).mockResolvedValue("hashed");
    vi.mocked(mockRepo.saveUser).mockImplementation(async (u) => u);

    // Act
    const result = await authServices.register({ email, password });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().email).toBe(email);
  });

  it("should orchestrate logout workflow through execute facade", async () => {
    // Arrange
    const token = "active-token";
    vi.mocked(mockRepo.deleteSession).mockResolvedValue(true);

    // Act
    const result = await authServices.logout({ token });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().success).toBe(true);
    expect(mockRepo.deleteSession).toHaveBeenCalledWith(token);
  });

  it("should orchestrate logoutAll workflow through execute facade", async () => {
    // Arrange
    const userId = "usr-123";
    vi.mocked(mockRepo.deleteSessionsByUserId).mockResolvedValue(2);

    // Act
    const result = await authServices.logoutAll({ userId });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().success).toBe(true);
  });

  it("should orchestrate refreshToken workflow through execute facade", async () => {
    // Arrange
    const refreshToken = "valid-refresh";
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
    vi.mocked(mockTokenProvider.signAccessToken).mockResolvedValue("new_acc");
    vi.mocked(mockTokenProvider.signRefreshToken).mockResolvedValue("new_ref");

    // Act
    const result = await authServices.refreshToken({ refreshToken });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().tokens.accessToken).toBe("new_acc");
  });

  it("should orchestrate createLoginAudit workflow through execute facade", async () => {
    // Arrange
    const auditEntity = LoginAuditEntity.create({
      id: "a1",
      action: "LOGIN_SUCCESS",
      details: "test audit",
    });
    vi.mocked(mockRepo.createLoginAudit).mockResolvedValue(auditEntity);

    // Act
    const result = await authServices.createLoginAudit({
      action: "LOGIN_SUCCESS",
      details: "test audit",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.createLoginAudit).toHaveBeenCalled();
  });
});
