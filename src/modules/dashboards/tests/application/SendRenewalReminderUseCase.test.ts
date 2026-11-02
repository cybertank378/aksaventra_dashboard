import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MailProviderInterface } from "@/modules/auth/domain/interfaces/MailProviderInterface";
import { SendRenewalReminderUseCase } from "@/modules/dashboards/application/usecase/SendRenewalReminderUseCase";
import {
  createMockDashboardRepository,
  FixedClockProvider,
} from "@/modules/dashboards/tests/mocks/mockFactories";

describe("SendRenewalReminderUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockDashboardRepository>;
  let clock: FixedClockProvider;
  let mockMailProvider: MailProviderInterface;
  let useCase: SendRenewalReminderUseCase;

  beforeEach(() => {
    mockRepo = createMockDashboardRepository();
    clock = new FixedClockProvider(new Date("2026-10-29T10:00:00Z"));
    mockMailProvider = {
      sendMail: vi.fn().mockResolvedValue(true),
    };
    useCase = new SendRenewalReminderUseCase(mockRepo, clock, mockMailProvider);
  });

  it("should return early message when no expiring licenses are found", async () => {
    // Arrange
    vi.mocked(mockRepo.findExpiringLicensesForReminder).mockResolvedValueOnce([]);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.totalProcessed).toBe(0);
    expect(data.sentCount).toBe(0);
    expect(data.message).toContain("Tidak ada lisensi");
  });

  it("should process expiring licenses, send emails, and create audit logs", async () => {
    // Arrange
    const dummyDate = new Date("2026-11-05T10:00:00Z"); // 7 days later
    vi.mocked(mockRepo.findExpiringLicensesForReminder).mockResolvedValueOnce([
      {
        id: "lic-1",
        clientName: "PT Maju Mundur",
        serialKey: "AKSA-1234-ABCD",
        expiresAt: dummyDate,
        recipientEmail: "admin@majumundur.com",
      },
    ]);

    // Act
    const result = await useCase.execute({
      actorUserId: "user-admin-1",
      actorIp: "192.168.1.1",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.totalProcessed).toBe(1);
    expect(data.sentCount).toBe(1);
    expect(data.reminders[0].daysRemaining).toBe(7);
    expect(mockMailProvider.sendMail).toHaveBeenCalledTimes(1);
    expect(mockRepo.createAuditLog).toHaveBeenCalledTimes(1);
    expect(mockRepo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "RENEWAL_REMINDER_SENT",
        target: "License:lic-1",
        userId: "user-admin-1",
      }),
    );
  });

  it("should filter by specific licenseIds when provided in input", async () => {
    // Arrange
    const dummyDate = new Date("2026-10-31T10:00:00Z"); // 2 days later
    vi.mocked(mockRepo.findExpiringLicensesForReminder).mockResolvedValueOnce([
      {
        id: "lic-spec-99",
        clientName: "PT Sukses Mandiri",
        serialKey: "AKSA-9999-SPEC",
        expiresAt: dummyDate,
        recipientEmail: null,
      },
    ]);

    // Act
    const result = await useCase.execute({
      licenseIds: ["lic-spec-99"],
      actorUserId: "user-admin-1",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(mockRepo.findExpiringLicensesForReminder).toHaveBeenCalledWith(
      expect.any(Date),
      expect.any(Date),
      ["lic-spec-99"],
    );
    expect(mockMailProvider.sendMail).not.toHaveBeenCalled(); // No recipient email
    expect(mockRepo.createAuditLog).toHaveBeenCalledTimes(1);
  });
});
