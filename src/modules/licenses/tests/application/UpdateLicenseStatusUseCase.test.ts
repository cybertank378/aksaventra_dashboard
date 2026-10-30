import { beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateLicenseStatusUseCase } from "@/modules/licenses/application/usecase/UpdateLicenseStatusUseCase";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

describe("UpdateLicenseStatusUseCase (Triple A)", () => {
  let mockRepo: LicenseRepositoryInterface;
  let useCase: UpdateLicenseStatusUseCase;

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
    useCase = new UpdateLicenseStatusUseCase(mockRepo);
  });

  it("should suspend an active license and record audit log", async () => {
    // Arrange
    const existing = LicenseEntity.create({
      id: "lic-to-suspend",
      serialKey: "AKSA-PRO-2026-SUSP",
      clientName: "PT Pelanggar Kebijakan",
      vaultSecret: "secret-vault-2",
      status: "ACTIVE",
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(existing);
    vi.mocked(mockRepo.update).mockResolvedValue();

    // Act
    const result = await useCase.execute(
      "lic-to-suspend",
      {
        status: "SUSPENDED",
        reason: "Pelanggaran pembayaran",
      },
      "admin-usr",
      "10.0.0.1",
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    const updated = result.getValue();
    expect(updated.status).toBe("SUSPENDED");
    expect(mockRepo.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: "LICENSE_STATUS_UPDATED",
        target: "lic-to-suspend",
      }),
    );
  });

  it("should extend license expiration date and activate if expired", async () => {
    // Arrange
    const existing = LicenseEntity.create({
      id: "lic-to-extend",
      serialKey: "AKSA-PRO-2026-EXT",
      clientName: "PT Perpanjangan",
      vaultSecret: "secret-vault-3",
      status: "EXPIRED",
      expiresAt: new Date("2026-01-01"),
    });

    vi.mocked(mockRepo.findById).mockResolvedValue(existing);
    vi.mocked(mockRepo.update).mockResolvedValue();

    const futureDate = "2027-12-31T23:59:59.000Z";

    // Act
    const result = await useCase.execute("lic-to-extend", {
      expiresAt: futureDate,
      reason: "Perpanjangan kontrak tahun 2027",
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const updated = result.getValue();
    expect(updated.status).toBe("ACTIVE");
    expect(updated.expiresAt).toBe(futureDate);
  });
});
