import { beforeEach, describe, expect, it, vi } from "vitest";
import { LicenseServices } from "@/modules/licenses/application/services/LicenseServices";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import { createMockLicenseRepository } from "@/modules/licenses/tests/mocks/mockFactories";

describe("LicenseServices (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockLicenseRepository>;
  let services: LicenseServices;

  beforeEach(() => {
    mockRepo = createMockLicenseRepository();
    services = new LicenseServices(mockRepo);
  });

  it("should delegate validateLicense to ValidateLicenseUseCase and return success", async () => {
    // Arrange
    const serialKey = "AKSA-SERVICE-TEST";
    const hwid = "HWID-SRV-1";
    const entity = LicenseEntity.create({
      id: "lic-srv",
      serialKey,
      clientName: "Test Client",
      vaultSecret: "SECRET",
      status: "ACTIVE",
      hwid,
    });

    vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(entity);
    vi.mocked(mockRepo.update).mockResolvedValue(undefined);

    // Act
    const result = await services.validateLicense({
      serial_key: serialKey,
      hwid,
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().valid).toBe(true);
    expect(result.getValue().client_name).toBe("Test Client");
  });
});
