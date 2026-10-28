import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidateLicenseUseCase } from "../../application/usecase/ValidateLicenseUseCase";
import { LicenseEntity } from "../../domain/entity/LicenseEntity";
import { createMockLicenseRepository } from "../mocks/mockFactories";

describe("ValidateLicenseUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockLicenseRepository>;
  let useCase: ValidateLicenseUseCase;

  beforeEach(() => {
    mockRepo = createMockLicenseRepository();
    useCase = new ValidateLicenseUseCase(mockRepo);
  });

  describe("Kondisi 1: Aktivasi Baru (First-time Activation)", () => {
    it("should bind HWID to license, update repository, and return success with vault_secret", async () => {
      // Arrange
      const serialKey = "AKSA-2026-NEW-ACTV";
      const hwid = "HWID-DEVICE-XYZ-111";
      const existingLicense = LicenseEntity.create({
        id: "lic-1",
        serialKey,
        clientName: "PT Enterprise Jaya",
        vaultSecret: "VAULT_SECRET_NEW_123",
        status: "ACTIVE",
        hwid: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(existingLicense);
      vi.mocked(mockRepo.update).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid,
        engine_version: "2.1.0",
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.valid).toBe(true);
      expect(data.client_name).toBe("PT Enterprise Jaya");
      expect(data.vault_secret).toBe("VAULT_SECRET_NEW_123");
      expect(data.message).toContain("diaktivasi dan dikunci");
      expect(existingLicense.hwid).toBe(hwid);
      expect(mockRepo.update).toHaveBeenCalledWith(existingLicense);
    });
  });

  describe("Kondisi 2: Device Terdaftar (Matching HWID)", () => {
    it("should verify existing device, update lastVerifiedAt, and return success with vault_secret", async () => {
      // Arrange
      const serialKey = "AKSA-2026-REGISTERED";
      const hwid = "HWID-EXISTING-DEVICE-222";
      const existingLicense = LicenseEntity.create({
        id: "lic-2",
        serialKey,
        clientName: "PT Global Mandiri",
        vaultSecret: "VAULT_SECRET_REGISTERED_456",
        status: "ACTIVE",
        hwid,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      });

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(existingLicense);
      vi.mocked(mockRepo.update).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid,
        engine_version: "2.1.0",
      });

      // Assert
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.valid).toBe(true);
      expect(data.client_name).toBe("PT Global Mandiri");
      expect(data.vault_secret).toBe("VAULT_SECRET_REGISTERED_456");
      expect(data.message).toContain("aktif dan terverifikasi");
      expect(mockRepo.update).toHaveBeenCalledWith(existingLicense);
    });
  });

  describe("Kondisi 3: Hardware Mismatch (Registered to another HWID)", () => {
    it("should reject request with HTTP 403 Forbidden when HWID does not match", async () => {
      // Arrange
      const serialKey = "AKSA-2026-LOCKED-KEY";
      const originalHwid = "ORIGINAL-DEVICE-HWID-333";
      const attackerHwid = "DIFFERENT-DEVICE-HWID-999";

      const existingLicense = LicenseEntity.create({
        id: "lic-3",
        serialKey,
        clientName: "PT Korporat Aman",
        vaultSecret: "VAULT_SECRET_789",
        status: "ACTIVE",
        hwid: originalHwid,
      });

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(existingLicense);

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid: attackerHwid,
        engine_version: "2.1.0",
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      const error = result.getError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toContain("Hardware Mismatch");
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("Kondisi 4: Lisensi Invalid / Expired / Suspended / Not Found", () => {
    it("should reject with HTTP 404 if serial key does not exist in database", async () => {
      // Arrange
      const serialKey = "AKSA-UNKNOWN-NONEXISTENT";
      const hwid = "DEVICE-HWID-000";

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(null);

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid,
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      const error = result.getError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain("Lisensi Tidak Ditemukan");
    });

    it("should reject with HTTP 401 if license has expired", async () => {
      // Arrange
      const serialKey = "AKSA-EXPIRED-KEY";
      const hwid = "DEVICE-HWID-EXPIRED";
      const expiredLicense = LicenseEntity.create({
        id: "lic-4",
        serialKey,
        clientName: "PT Kadaluarsa",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        hwid,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
      });

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(expiredLicense);

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid,
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      const error = result.getError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("kadaluarsa");
    });

    it("should reject with HTTP 401 if license is SUSPENDED", async () => {
      // Arrange
      const serialKey = "AKSA-SUSPENDED-KEY";
      const hwid = "DEVICE-HWID-SUSPENDED";
      const suspendedLicense = LicenseEntity.create({
        id: "lic-5",
        serialKey,
        clientName: "PT Ditangguhkan",
        vaultSecret: "SECRET",
        status: "SUSPENDED",
        hwid,
      });

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(suspendedLicense);

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid,
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      const error = result.getError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("ditangguhkan");
    });

    it("should reject with HTTP 401 if serial_key or hwid is missing / empty", async () => {
      // Arrange
      const emptySerial = "";
      const emptyHwid = "   ";

      // Act
      const result = await useCase.execute({
        serial_key: emptySerial,
        hwid: emptyHwid,
      });

      // Assert
      expect(result.isSuccess).toBe(false);
      const error = result.getError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain("wajib diisi");
    });
  });
});
