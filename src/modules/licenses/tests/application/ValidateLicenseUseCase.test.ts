import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidateLicenseUseCase } from "@/modules/licenses/application/usecase/ValidateLicenseUseCase";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import {
  createMockLicenseRepository,
  createMockLicenseValidationLogRepository,
} from "@/modules/licenses/tests/mocks/mockFactories";

describe("ValidateLicenseUseCase (Triple A Pattern)", () => {
  let mockRepo: ReturnType<typeof createMockLicenseRepository>;
  let mockLogRepo: ReturnType<typeof createMockLicenseValidationLogRepository>;
  let useCase: ValidateLicenseUseCase;

  beforeEach(() => {
    mockRepo = createMockLicenseRepository();
    mockLogRepo = createMockLicenseValidationLogRepository();
    useCase = new ValidateLicenseUseCase(mockRepo, mockLogRepo);
  });

  describe("Kondisi 1: Aktivasi Baru (First-time Activation)", () => {
    it("should bind HWID to license, update repository, and record ACTIVATED log", async () => {
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

      // FR-06 Validation Audit Log
      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("ACTIVATED");
      expect(recordedLog.statusCode).toBe(200);
      expect(recordedLog.licenseId).toBe("lic-1");
      expect(recordedLog.serialKeyHint).toBe("ACTV");
    });
  });

  describe("Kondisi 2: Device Terdaftar (Matching HWID)", () => {
    it("should verify existing device, update lastVerifiedAt, and record VERIFIED log", async () => {
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

      // FR-06 Validation Audit Log
      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("VERIFIED");
      expect(recordedLog.statusCode).toBe(200);
      expect(recordedLog.licenseId).toBe("lic-2");
    });
  });

  describe("Kondisi 3: Hardware Mismatch (Registered to another HWID)", () => {
    it("should reject request with HTTP 403 Forbidden and record HWID_MISMATCH log", async () => {
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

      // FR-06 Validation Audit Log
      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("HWID_MISMATCH");
      expect(recordedLog.statusCode).toBe(403);
      expect(recordedLog.licenseId).toBe("lic-3");
    });
  });

  describe("Kondisi 4: Lisensi Invalid / Expired / Suspended / Not Found", () => {
    it("should reject with HTTP 404 and record NOT_FOUND log if serial key does not exist", async () => {
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

      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("NOT_FOUND");
      expect(recordedLog.statusCode).toBe(404);
    });

    it("should reject with HTTP 401 and record EXPIRED log if license has expired", async () => {
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
      vi.mocked(mockRepo.update).mockResolvedValue(undefined);

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
      expect(expiredLicense.status).toBe("EXPIRED");
      expect(mockRepo.update).toHaveBeenCalledWith(expiredLicense);

      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("EXPIRED");
      expect(recordedLog.statusCode).toBe(401);
    });

    it("should reject with HTTP 401 and record SUSPENDED log if license is SUSPENDED", async () => {
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

      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("SUSPENDED");
      expect(recordedLog.statusCode).toBe(401);
    });

    it("should reject with HTTP 401 and record BAD_REQUEST log if serial_key or hwid is empty", async () => {
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

      expect(mockLogRepo.record).toHaveBeenCalledTimes(1);
      const recordedLog = vi.mocked(mockLogRepo.record).mock.calls[0][0];
      expect(recordedLog.result).toBe("BAD_REQUEST");
      expect(recordedLog.statusCode).toBe(401);
    });
  });

  describe("Best-effort Logging Non-blocking Behavior", () => {
    it("should not fail validation when validation log repository throws an unexpected error", async () => {
      // Arrange
      const serialKey = "AKSA-BEST-EFFORT-KEY";
      const hwid = "HWID-BEST-EFFORT";
      const existingLicense = LicenseEntity.create({
        id: "lic-best",
        serialKey,
        clientName: "PT Resilience",
        vaultSecret: "SECRET_RESILIENT",
        status: "ACTIVE",
        hwid,
      });

      vi.mocked(mockRepo.findBySerialKey).mockResolvedValue(existingLicense);
      vi.mocked(mockRepo.update).mockResolvedValue(undefined);
      vi.mocked(mockLogRepo.record).mockRejectedValue(new Error("Database connection timeout"));

      // Act
      const result = await useCase.execute({
        serial_key: serialKey,
        hwid,
      });

      // Assert: Validation must still succeed!
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().valid).toBe(true);
    });
  });
});
