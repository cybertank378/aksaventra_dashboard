import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateLicenseUseCase } from "@/modules/licenses/application/usecase/CreateLicenseUseCase";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

describe("CreateLicenseUseCase (Triple A)", () => {
  let mockRepo: LicenseRepositoryInterface;
  let useCase: CreateLicenseUseCase;

  beforeEach(() => {
    mockRepo = {
      findBySerialKey: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      findManyPaginated: vi.fn(),
      getStats: vi.fn(),
      findByIdWithRecentLogs: vi.fn(),
    };
    useCase = new CreateLicenseUseCase(mockRepo);
  });

  it("should create new license with auto-generated serial key and record audit log", async () => {
    // Arrange
    vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(null);
    vi.mocked(mockRepo.save).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      {
        clientName: "PT Sumber Makmur",
        tier: "PRO",
        durationMonths: 12,
      },
      "user-admin-1",
      "192.168.1.1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const created = result.getValue();
    expect(created.clientName).toBe("PT Sumber Makmur");
    expect(created.serialKey).toMatch(/^AKSA-PRO-\d{4}-[A-Z0-9]+$/);
    expect(created.status).toBe("ACTIVE");
    expect(created.isBound).toBe(false);
    expect(created.expiresAt).not.toBeNull();
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "LICENSE_CREATED",
        userId: "user-admin-1",
      }),
    );
  });

  it("should fail if clientName is empty", async () => {
    // Act
    const result = await useCase.execute({
      clientName: "   ",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain("Nama klien");
  });
});

