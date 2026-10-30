import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResetDeviceHwidUseCase } from "@/modules/licenses/application/usecase/ResetDeviceHwidUseCase";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

describe("ResetDeviceHwidUseCase (Triple A)", () => {
  let mockRepo: LicenseRepositoryInterface;
  let useCase: ResetDeviceHwidUseCase;

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
    useCase = new ResetDeviceHwidUseCase(mockRepo);
  });

  it("should reset HWID to null and record audit log", async () => {
    // Arrange
    const existing = LicenseEntity.create({
      id: "lic-bound",
      serialKey: "AKSA-PRO-2026-LOCK",
      clientName: "PT Ganti Server",
      vaultSecret: "secret-vault-1",
      status: "ACTIVE",
      hwid: "ORIGINAL-HWID-99",
      activatedAt: new Date(),
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(existing);
    vi.mocked(mockRepo.update).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      {
        id: "lic-bound",
        reason: "Penggantian Motherboard Rusak",
      },
      "user-admin-1",
      "127.0.0.1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const updated = result.getValue();
    expect(updated.hwid).toBeNull();
    expect(updated.isBound).toBe(false);
    expect(mockRepo.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: "user-admin-1",
        action: "LICENSE_HWID_RESET",
        target: "lic-bound",
        ipAddress: "127.0.0.1",
      }),
    );
  });

  it("should return error if license ID does not exist", async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act
    const result = await useCase.execute({
      id: "non-existent-id",
    });

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(result.getError().message).toContain("tidak ditemukan");
  });
});
