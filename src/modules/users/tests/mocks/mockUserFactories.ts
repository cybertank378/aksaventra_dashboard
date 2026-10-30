import { vi } from "vitest";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";

export function createMockUserRepository(): UserRepositoryInterface {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    updateStatusAndRevokeSessions: vi.fn(),
    findManyPaginated: vi.fn().mockResolvedValue({
      users: [],
      total: 0,
      sessionCounts: new Map(),
    }),
    getStats: vi.fn().mockResolvedValue({
      totalUsers: 0,
      activeUsers: 0,
      lockedOrInactiveUsers: 0,
      activeSessionsCount: 0,
      roleCounts: { ADMIN: 0, OPERATOR: 0, AUDITOR: 0 },
    }),
    findUserWithDetails: vi.fn().mockResolvedValue(null),
    revokeAllSessions: vi.fn().mockResolvedValue(0),
    countActiveAdmins: vi.fn().mockResolvedValue(1),
  };
}

export function createMockPasswordHasher(): PasswordHasherInterface {
  return {
    hash: vi.fn().mockResolvedValue("mocked_argon2id_hash_123"),
    compare: vi.fn().mockResolvedValue(true),
  };
}
