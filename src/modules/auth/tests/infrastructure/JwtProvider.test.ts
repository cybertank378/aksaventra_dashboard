import { describe, expect, it } from "vitest";
import type { AuthJwtPayload } from "@/modules/auth/domain/types/AuthJwtPayload";
import { JwtProvider } from "@/modules/auth/infrastructure/providers/JwtProvider";

describe("JwtProvider with Jose (Triple A Pattern)", () => {
  const testSecret = "test_super_secret_jwt_key_at_least_32_chars_long!!";
  const jwtProvider = new JwtProvider(testSecret);

  it("should sign access token and verify valid payload", async () => {
    // Arrange
    const payload: AuthJwtPayload = {
      sub: "usr-123",
      email: "admin@aksaventra.com",
      role: "ADMIN",
    };

    // Act
    const token = await jwtProvider.signAccessToken(payload);
    const verified = await jwtProvider.verifyToken(token);

    // Assert
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(verified).not.toBeNull();
    expect(verified?.sub).toBe("usr-123");
    expect(verified?.email).toBe("admin@aksaventra.com");
    expect(verified?.role).toBe("ADMIN");
  });

  it("should sign refresh token with longer expiration", async () => {
    // Arrange
    const payload: AuthJwtPayload = {
      sub: "usr-456",
      email: "user@aksaventra.com",
      role: "ADMIN",
    };

    // Act
    const refreshToken = await jwtProvider.signRefreshToken(payload);
    const verified = await jwtProvider.verifyToken(refreshToken);

    // Assert
    expect(refreshToken).toBeDefined();
    expect(verified?.sub).toBe("usr-456");
  });

  it("should return null when token is tampered or signature invalid", async () => {
    // Arrange
    const payload: AuthJwtPayload = {
      sub: "usr-789",
      email: "fake@aksaventra.com",
      role: "ADMIN",
    };
    const validToken = await jwtProvider.signAccessToken(payload);
    const tamperedToken = `${validToken.slice(0, -5)}abcde`;

    // Act
    const verified = await jwtProvider.verifyToken(tamperedToken);

    // Assert
    expect(verified).toBeNull();
  });

  it("should return null for malformed tokens", async () => {
    // Arrange
    const malformedToken = "not.a.valid.jwt";

    // Act
    const verified = await jwtProvider.verifyToken(malformedToken);

    // Assert
    expect(verified).toBeNull();
  });
});
