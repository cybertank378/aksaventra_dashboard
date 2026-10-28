import { vi } from "vitest";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { MailProviderInterface } from "@/modules/auth/domain/interfaces/MailProviderInterface";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";
import type { AuthJwtPayload } from "@/modules/auth/domain/types/AuthJwtPayload";

export function createMockAuthRepository(): AuthRepositoryInterface {
  return {
    findUserById: vi.fn(),
    findUserByEmail: vi.fn(),
    saveUser: vi.fn(),
    updateUser: vi.fn(),
    createSession: vi.fn(),
    findSessionByToken: vi.fn(),
    deleteSession: vi.fn(),
    deleteSessionsByUserId: vi.fn(),
    createLoginAudit: vi.fn(),
    findRecentLoginAudits: vi.fn(),
    findFailedLoginAudits: vi.fn(),
    findSuspiciousLoginAudits: vi.fn(),
    findLoginAuditsByUserId: vi.fn(),
    saveEmailVerificationToken: vi.fn(),
    findEmailVerificationToken: vi.fn(),
    savePasswordResetToken: vi.fn(),
    findPasswordResetToken: vi.fn(),
  };
}

export function createMockPasswordHasher(): PasswordHasherInterface {
  return {
    hash: vi.fn().mockImplementation(async (plain: string) => `hashed_${plain}`),
    compare: vi
      .fn()
      .mockImplementation(async (plain: string, hashed: string) => hashed === `hashed_${plain}`),
  };
}

export function createMockTokenProvider(): TokenProviderInterface {
  return {
    signAccessToken: vi.fn().mockResolvedValue("mock_access_token"),
    signRefreshToken: vi.fn().mockResolvedValue("mock_refresh_token"),
    verifyToken: vi
      .fn()
      .mockImplementation(async (token: string): Promise<AuthJwtPayload | null> => {
        if (
          token === "valid_access_token" ||
          token === "valid_refresh_token" ||
          token === "mock_access_token"
        ) {
          return {
            sub: "user-123",
            email: "admin@aksaventra.com",
            role: "ADMIN",
          };
        }
        return null;
      }),
  };
}

export function createMockMailProvider(): MailProviderInterface {
  return {
    sendMail: vi.fn().mockResolvedValue(true),
  };
}
