import { beforeEach, describe, expect, it, vi } from "vitest";
import { ListLicensesUseCase } from "@/modules/licenses/application/usecase/ListLicensesUseCase";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";

describe("ListLicensesUseCase (Triple A)", () => {
  let mockRepo: LicenseRepositoryInterface;
  let useCase: ListLicensesUseCase;

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
    useCase = new ListLicensesUseCase(mockRepo);
  });

  it("should return paginated list of licenses with mapped DTOs for ADMIN", async () => {
    // Arrange
    const sampleLicense = LicenseEntity.create({
      id: "lic-1",
      serialKey: "AKSA-PRO-2026-ABCD",
      clientName: "PT Nusantara",
      vaultSecret: "secret-123",
      status: "ACTIVE",
      hwid: "HWID-TEST-001",
      expiresAt: new Date(Date.now() + 86400000 * 100),
    });

    vi.mocked(mockRepo.findManyPaginated).mockResolvedValue({
      licenses: [sampleLicense],
      total: 1,
    });

    // Act
    const result = await useCase.execute({ page: 1, limit: 10 }, "ADMIN");

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.licenses).toHaveLength(1);
    expect(data.licenses[0].clientName).toBe("PT Nusantara");
    expect(data.licenses[0].serialKey).toBe("AKSA-PRO-2026-ABCD");
    expect(data.licenses[0].isBound).toBe(true);
    expect(data.pagination.total).toBe(1);
    expect(data.pagination.totalPages).toBe(1);
  });

  it("should mask serial key when accessed by AUDITOR", async () => {
    // Arrange
    const sampleLicense = LicenseEntity.create({
      id: "lic-2",
      serialKey: "AKSA-ENTERPRISE-2026-9999",
      clientName: "CV Maju",
      vaultSecret: "secret-abc",
      status: "ACTIVE",
    });

    vi.mocked(mockRepo.findManyPaginated).mockResolvedValue({
      licenses: [sampleLicense],
      total: 1,
    });

    // Act
    const result = await useCase.execute({ page: 1, limit: 10 }, "AUDITOR");

    // Assert
    expect(result.isSuccess).toBe(true);
    const data = result.getValue();
    expect(data.licenses[0].serialKey).toContain("••••");
    expect(data.licenses[0].serialKeyMasked).toContain("••••");
  });
});
