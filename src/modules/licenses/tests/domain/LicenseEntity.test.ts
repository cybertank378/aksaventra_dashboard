import { describe, expect, it } from "vitest";
import { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";

describe("LicenseEntity (Triple A Pattern)", () => {
  describe("create", () => {
    it("should instantiate a LicenseEntity with provided properties", () => {
      // Arrange
      const props = {
        id: "lic-1",
        serialKey: "AKSA-2026-TEST-KEY1",
        hwid: null,
        clientName: "PT Teknologi Nusantara",
        vaultSecret: "VAULT_SECRET_XYZ_999",
        status: "ACTIVE" as const,
        expiresAt: new Date("2028-12-31T23:59:59Z"),
        engineVersion: "1.0.0",
      };

      // Act
      const entity = LicenseEntity.create(props);

      // Assert
      expect(entity.id).toBe("lic-1");
      expect(entity.serialKey).toBe("AKSA-2026-TEST-KEY1");
      expect(entity.hwid).toBeNull();
      expect(entity.clientName).toBe("PT Teknologi Nusantara");
      expect(entity.vaultSecret).toBe("VAULT_SECRET_XYZ_999");
      expect(entity.status).toBe("ACTIVE");
      expect(entity.expiresAt).toEqual(props.expiresAt);
      expect(entity.engineVersion).toBe("1.0.0");
    });
  });

  describe("isExpired", () => {
    it("should return false if expiresAt is null (lifetime license)", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-2",
        serialKey: "AKSA-LIFETIME-KEY",
        clientName: "Enterprise Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        expiresAt: null,
      });

      // Act
      const expired = entity.isExpired();

      // Assert
      expect(expired).toBe(false);
    });

    it("should return false if expiresAt is in the future", () => {
      // Arrange
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year ahead
      const entity = LicenseEntity.create({
        id: "lic-3",
        serialKey: "AKSA-ACTIVE-FUTURE",
        clientName: "Future Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        expiresAt: futureDate,
      });

      // Act
      const expired = entity.isExpired();

      // Assert
      expect(expired).toBe(false);
    });

    it("should return true if expiresAt is in the past", () => {
      // Arrange
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // 1 day ago
      const entity = LicenseEntity.create({
        id: "lic-4",
        serialKey: "AKSA-EXPIRED-KEY",
        clientName: "Expired Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        expiresAt: pastDate,
      });

      // Act
      const expired = entity.isExpired();

      // Assert
      expect(expired).toBe(true);
    });

    it("should return true if license age from activatedAt reaches or exceeds 1 year (365 days)", () => {
      // Arrange
      const oneYearAndOneDayAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 366);
      const entity = LicenseEntity.create({
        id: "lic-4b",
        serialKey: "AKSA-OLD-ACTIVATED",
        clientName: "Old Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        activatedAt: oneYearAndOneDayAgo,
      });

      // Act
      const expired = entity.isExpired();

      // Assert
      expect(expired).toBe(true);
    });

    it("should return true if license age from createdAt reaches or exceeds 1 year (365 days)", () => {
      // Arrange
      const oneYearAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);
      const entity = LicenseEntity.create({
        id: "lic-4c",
        serialKey: "AKSA-OLD-CREATED",
        clientName: "Old Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        createdAt: oneYearAgo,
      });

      // Act
      const expired = entity.isExpired();

      // Assert
      expect(expired).toBe(true);
    });

    it("should return true if status is already EXPIRED", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-4d",
        serialKey: "AKSA-STATUS-EXPIRED",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "EXPIRED",
      });

      // Act
      const expired = entity.isExpired();

      // Assert
      expect(expired).toBe(true);
    });
  });

  describe("markExpired", () => {
    it("should transition status to EXPIRED", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-4e",
        serialKey: "AKSA-TO-EXPIRE",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
      });

      // Act
      entity.markExpired();

      // Assert
      expect(entity.status).toBe("EXPIRED");
      expect(entity.isActive()).toBe(false);
      expect(entity.isExpired()).toBe(true);
    });
  });

  describe("isActive", () => {
    it("should return true if status is ACTIVE and not expired", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-5",
        serialKey: "AKSA-ACTIVE-VALID",
        clientName: "Active Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
      });

      // Act
      const active = entity.isActive();

      // Assert
      expect(active).toBe(true);
    });

    it("should return false if status is SUSPENDED", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-6",
        serialKey: "AKSA-SUSPENDED",
        clientName: "Suspended Client",
        vaultSecret: "SECRET",
        status: "SUSPENDED",
      });

      // Act
      const active = entity.isActive();

      // Assert
      expect(active).toBe(false);
    });

    it("should return false if license has expired even if status is ACTIVE", () => {
      // Arrange
      const pastDate = new Date(Date.now() - 1000 * 60);
      const entity = LicenseEntity.create({
        id: "lic-7",
        serialKey: "AKSA-EXPIRED-STATUS",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        expiresAt: pastDate,
      });

      // Act
      const active = entity.isActive();

      // Assert
      expect(active).toBe(false);
    });
  });

  describe("hasHardwareBinding and matchesHardwareId", () => {
    it("should return false for hasHardwareBinding when hwid is empty or null", () => {
      // Arrange
      const entityWithoutHwid = LicenseEntity.create({
        id: "lic-8",
        serialKey: "AKSA-NO-HWID",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        hwid: null,
      });

      // Act
      const hasBinding = entityWithoutHwid.hasHardwareBinding();

      // Assert
      expect(hasBinding).toBe(false);
    });

    it("should return true for hasHardwareBinding when hwid is set", () => {
      // Arrange
      const entityWithHwid = LicenseEntity.create({
        id: "lic-9",
        serialKey: "AKSA-BOUND-HWID",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        hwid: "HWID-UUID-12345",
      });

      // Act
      const hasBinding = entityWithHwid.hasHardwareBinding();

      // Assert
      expect(hasBinding).toBe(true);
    });

    it("should correctly check matching and mismatching hardware IDs", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-10",
        serialKey: "AKSA-MATCH-HWID",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        hwid: "E4:5F:01:AB:CD:EF",
      });

      // Act
      const matchResult = entity.matchesHardwareId("  E4:5F:01:AB:CD:EF  ");
      const mismatchResult = entity.matchesHardwareId("00:11:22:33:44:55");

      // Assert
      expect(matchResult).toBe(true);
      expect(mismatchResult).toBe(false);
    });
  });

  describe("bindHardwareId", () => {
    it("should lock the hardware ID and set activation timestamps", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-11",
        serialKey: "AKSA-NEW-ACTIVATION",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
      });

      // Act
      entity.bindHardwareId("DEVICE-HWID-999");

      // Assert
      expect(entity.hwid).toBe("DEVICE-HWID-999");
      expect(entity.activatedAt).toBeInstanceOf(Date);
      expect(entity.lastVerifiedAt).toBeInstanceOf(Date);
      expect(entity.expiresAt).toBeInstanceOf(Date);
      expect(entity.hasHardwareBinding()).toBe(true);
    });
  });

  describe("markVerified", () => {
    it("should update lastVerifiedAt and engineVersion", () => {
      // Arrange
      const entity = LicenseEntity.create({
        id: "lic-12",
        serialKey: "AKSA-VERIFY",
        clientName: "Client",
        vaultSecret: "SECRET",
        status: "ACTIVE",
        hwid: "EXISTING-HWID",
        engineVersion: "1.0.0",
      });

      // Act
      entity.markVerified("2.0.0");

      // Assert
      expect(entity.engineVersion).toBe("2.0.0");
      expect(entity.lastVerifiedAt).toBeInstanceOf(Date);
    });
  });

  describe("toResponseContract", () => {
    it("should format valid success contract required by aksaventra_engine client", () => {
      // Arrange
      const expiresAt = new Date("2029-01-01T00:00:00Z");
      const entity = LicenseEntity.create({
        id: "lic-13",
        serialKey: "AKSA-CONTRACT-TEST",
        clientName: "PT Aksaventra Inovasi",
        vaultSecret: "ENC_VAULT_KEY_ABC123",
        status: "ACTIVE",
        expiresAt,
      });

      // Act
      const contract = entity.toResponseContract("Lisensi berhasil divalidasi.");

      // Assert
      expect(contract.valid).toBe(true);
      expect(contract.message).toBe("Lisensi berhasil divalidasi.");
      expect(contract.client_name).toBe("PT Aksaventra Inovasi");
      expect(contract.vault_secret).toBe("ENC_VAULT_KEY_ABC123");
      expect(contract.expires_at).toBe(Math.floor(expiresAt.getTime() / 1000));
    });
  });
});
