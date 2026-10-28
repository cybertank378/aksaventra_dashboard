import { describe, expect, it } from "vitest";
import { AccessToken } from "@/modules/auth/domain/value-object/AccessToken";
import { LoginAuditMetadata } from "@/modules/auth/domain/value-object/LoginAuditMetadata";
import { RefreshToken } from "@/modules/auth/domain/value-object/RefreshToken";
import { SessionFingerprint } from "@/modules/auth/domain/value-object/SessionFingerprint";

describe("Domain Value Objects (Triple A Pattern)", () => {
  describe("AccessToken & RefreshToken", () => {
    it("should create valid AccessToken and throw on empty token", () => {
      // Arrange
      const tokenValue = "valid.jwt.token";
      const expiresAt = new Date(Date.now() + 3600_000);

      // Act
      const accessToken = AccessToken.create(tokenValue, expiresAt);

      // Assert
      expect(accessToken.token).toBe(tokenValue);
      expect(accessToken.expiresAt).toEqual(expiresAt);
      expect(accessToken.isExpired()).toBe(false);
      expect(() => AccessToken.create("", expiresAt)).toThrow();
    });

    it("should create valid RefreshToken and throw on empty token", () => {
      // Arrange
      const refreshValue = "refresh.uuid.token";
      const expiresAt = new Date(Date.now() + 86400_000);

      // Act
      const refreshToken = RefreshToken.create(refreshValue, expiresAt);

      // Assert
      expect(refreshToken.token).toBe(refreshValue);
      expect(refreshToken.expiresAt).toEqual(expiresAt);
      expect(refreshToken.isExpired()).toBe(false);
      expect(() => RefreshToken.create("", expiresAt)).toThrow();
    });
  });

  describe("SessionFingerprint", () => {
    it("should create session fingerprint and validate equality", () => {
      // Arrange
      const hash = "computed-sha256-hash";
      const ipAddress = "192.168.1.100";
      const userAgent = "Mozilla/5.0";

      // Act
      const fp1 = SessionFingerprint.create({ hash, ipAddress, userAgent });
      const fp2 = SessionFingerprint.create({ hash, ipAddress, userAgent });

      // Assert
      expect(fp1.hash).toBe(hash);
      expect(fp1.ipAddress).toBe(ipAddress);
      expect(fp1.userAgent).toBe(userAgent);
      expect(fp1.equals(fp2)).toBe(true);
      expect(() => SessionFingerprint.create({ hash: "" })).toThrow();
    });
  });

  describe("LoginAuditMetadata", () => {
    it("should format audit metadata correctly", () => {
      // Arrange
      const ipAddress = "127.0.0.1";
      const userAgent = "Vitest / Node.js";
      const reason = "Successful password login";
      const timestamp = new Date();

      // Act
      const meta = LoginAuditMetadata.create({
        ipAddress,
        userAgent,
        reason,
        timestamp,
      });

      // Assert
      expect(meta.ipAddress).toBe(ipAddress);
      expect(meta.userAgent).toBe(userAgent);
      expect(meta.reason).toBe(reason);
      expect(meta.timestamp).toEqual(timestamp);
    });
  });
});
