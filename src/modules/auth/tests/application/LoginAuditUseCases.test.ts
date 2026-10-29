import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateLoginAuditUseCase } from "@/modules/auth/application/usecase/CreateLoginAuditUseCase";
import { FindFailedLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindFailedLoginAuditsUseCase";
import { FindLoginAuditsByUserUseCase } from "@/modules/auth/application/usecase/FindLoginAuditsByUserUseCase";
import { FindRecentLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindRecentLoginAuditsUseCase";
import { FindSuspiciousLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindSuspiciousLoginAuditsUseCase";
import { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import { createMockAuthRepository } from "@/modules/auth/tests/mocks/mockFactories";

describe("Login Audit Use Cases (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockAuthRepository>;

  beforeEach(() => {
    mockRepo = createMockAuthRepository();
  });

  it("should create login audit successfully", async () => {
    // Arrange
    const useCase = new CreateLoginAuditUseCase(mockRepo);
    const auditEntity = LoginAuditEntity.create({
      id: "audit-1",
      userId: "usr-1",
      action: "LOGIN_SUCCESS",
      details: "Login success",
    });
    vi.mocked(mockRepo.createLoginAudit).mockResolvedValue(auditEntity);

    // Act
    const result = await useCase.execute({
      userId: "usr-1",
      action: "LOGIN_SUCCESS",
      details: "Login success",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.createLoginAudit).toHaveBeenCalled();
  });

  it("should find recent login audits", async () => {
    // Arrange
    const useCase = new FindRecentLoginAuditsUseCase(mockRepo);
    const mockAudits = [
      LoginAuditEntity.create({ id: "a1", action: "LOGIN_SUCCESS" }),
      LoginAuditEntity.create({ id: "a2", action: "LOGIN_FAILED" }),
    ];
    vi.mocked(mockRepo.findRecentLoginAudits).mockResolvedValue(mockAudits);

    // Act
    const result = await useCase.execute({ limit: 10 });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().length).toBe(2);
    expect(mockRepo.findRecentLoginAudits).toHaveBeenCalledWith(10);
  });

  it("should find failed login audits", async () => {
    // Arrange
    const useCase = new FindFailedLoginAuditsUseCase(mockRepo);
    const mockAudits = [LoginAuditEntity.create({ id: "a2", action: "LOGIN_FAILED" })];
    vi.mocked(mockRepo.findFailedLoginAudits).mockResolvedValue(mockAudits);

    // Act
    const result = await useCase.execute({ limit: 5 });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().length).toBe(1);
    expect(mockRepo.findFailedLoginAudits).toHaveBeenCalledWith(5);
  });

  it("should find suspicious login audits", async () => {
    // Arrange
    const useCase = new FindSuspiciousLoginAuditsUseCase(mockRepo);
    const suspiciousAudit = LoginAuditEntity.create({
      id: "a3",
      action: "LOGIN_FAILED",
      details: "Suspicious login attempt",
    });
    vi.mocked(mockRepo.findSuspiciousLoginAudits).mockResolvedValue([suspiciousAudit]);

    // Act
    const result = await useCase.execute({ limit: 5 });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().length).toBe(1);
    expect(mockRepo.findSuspiciousLoginAudits).toHaveBeenCalledWith(5);
  });

  it("should find login audits by user id", async () => {
    // Arrange
    const useCase = new FindLoginAuditsByUserUseCase(mockRepo);
    const userAudits = [
      LoginAuditEntity.create({ id: "a4", userId: "usr-1", action: "LOGIN_SUCCESS" }),
    ];
    vi.mocked(mockRepo.findLoginAuditsByUserId).mockResolvedValue(userAudits);

    // Act
    const result = await useCase.execute({ userId: "usr-1", limit: 10 });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().length).toBe(1);
    expect(mockRepo.findLoginAuditsByUserId).toHaveBeenCalledWith("usr-1", 10);
  });
});
