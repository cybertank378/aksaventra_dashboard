import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/core/libs/prisma";
import { GetSecurityAuditLogsUseCase } from "@/modules/auth/application/usecase/GetSecurityAuditLogsUseCase";

vi.mock("@/core/libs/prisma", () => ({
  prisma: {
    auditLog: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("GetSecurityAuditLogsUseCase (Triple A Pattern)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return summary metrics and paginated audit logs", async () => {
    // Arrange
    vi.mocked(prisma.auditLog.count)
      .mockResolvedValueOnce(184) // totalAdminActions30d
      .mockResolvedValueOnce(28) // loginSuccess24h
      .mockResolvedValueOnce(7) // loginFailedAttempts
      .mockResolvedValueOnce(12) // criticalMutationsCount
      .mockResolvedValueOnce(1); // total filtered logs

    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
      {
        id: "log-1",
        userId: "usr-1",
        action: "SETTINGS_UPDATED",
        target: "system_settings",
        details: '{"expiringSoonThresholdDays": 30}',
        ipAddress: "103.14.21.88",
        createdAt: new Date("2026-10-31T08:20:00Z"),
        user: {
          id: "usr-1",
          name: "M. Fahd Indrawan",
          email: "admin@aksaventra.co.id",
          role: "ADMIN",
        },
      },
    ] as unknown as never);

    const useCase = new GetSecurityAuditLogsUseCase();

    // Act
    const result = await useCase.execute({
      page: 1,
      limit: 10,
      tab: "audit_logs",
    });

    // Assert
    expect(result.summary.totalAdminActions30d).toBe(184);
    expect(result.summary.loginSuccess24h).toBe(28);
    expect(result.summary.loginFailedAttempts).toBe(7);
    expect(result.summary.criticalMutationsCount).toBe(12);
    expect(result.logs).toHaveLength(1);
    expect(result.logs[0].action).toBe("SETTINGS_UPDATED");
    expect(result.logs[0].userName).toBe("M. Fahd Indrawan");
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("should filter by search keyword when provided", async () => {
    // Arrange
    vi.mocked(prisma.auditLog.count).mockResolvedValue(0);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

    const useCase = new GetSecurityAuditLogsUseCase();

    // Act
    const result = await useCase.execute({
      page: 1,
      limit: 10,
      search: "HWID_RESET",
      tab: "audit_logs",
    });

    // Assert
    expect(result.logs).toHaveLength(0);
    expect(prisma.auditLog.findMany).toHaveBeenCalled();
  });
});
