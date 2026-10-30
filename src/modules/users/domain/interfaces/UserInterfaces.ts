import type { UserRole } from "@/libs/enums";
import type { UserAccountState } from "@/modules/users/domain/dto/UserResponseDTO";
import type { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";

export interface UserQueryParams {
  page: number;
  limit: number;
  search?: string;
  role?: "ALL" | UserRole;
  accountState?: "ALL" | UserAccountState;
  sortBy?: "name" | "email" | "role" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface UserStatsResult {
  totalUsers: number;
  activeUsers: number;
  lockedOrInactiveUsers: number;
  activeSessionsCount: number;
  roleCounts: {
    ADMIN: number;
    OPERATOR: number;
    AUDITOR: number;
    CLIENT: number;
  };
}

export interface RawSessionRecord {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface RawLoginAuditRecord {
  id: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  failureReason: string | null;
  createdAt: Date;
}

export interface UserWithDetailsResult {
  user: ManagedUserEntity;
  activeSessions: RawSessionRecord[];
  recentLoginAudits: RawLoginAuditRecord[];
}

export interface AuditLogPayload {
  userId?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}

export interface UserRepositoryInterface {
  findById(id: string): Promise<ManagedUserEntity | null>;
  findByEmail(email: string): Promise<ManagedUserEntity | null>;
  save(user: ManagedUserEntity, passwordHash: string, audit?: AuditLogPayload): Promise<void>;
  update(user: ManagedUserEntity, audit?: AuditLogPayload): Promise<void>;
  updateStatusAndRevokeSessions(
    user: ManagedUserEntity,
    revokeSessions: boolean,
    audit?: AuditLogPayload,
  ): Promise<void>;
  findManyPaginated(
    params: UserQueryParams,
  ): Promise<{ users: ManagedUserEntity[]; total: number; sessionCounts: Map<string, number> }>;
  getStats(): Promise<UserStatsResult>;
  findUserWithDetails(id: string, auditLimit?: number): Promise<UserWithDetailsResult | null>;
  revokeAllSessions(userId: string, audit?: AuditLogPayload): Promise<number>;
  countActiveAdmins(): Promise<number>;
}
