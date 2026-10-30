import type { UserRole } from "@/libs/enums";

export type UserAccountState = "ACTIVE" | "LOCKED" | "INACTIVE";

export interface UserAdminItemDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  accountState: UserAccountState;
  isEmailVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  activeSessionsCount: number;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UserListPaginationDTO {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListResponseDTO {
  users: UserAdminItemDTO[];
  pagination: UserListPaginationDTO;
}

export interface UserStatsResponseDTO {
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

export interface UserActiveSessionDTO {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface UserLoginAuditDTO {
  id: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface UserDetailResponseDTO extends UserAdminItemDTO {
  activeSessions: UserActiveSessionDTO[];
  recentLoginAudits: UserLoginAuditDTO[];
}

export interface UserMutationResponseDTO {
  success: boolean;
  message: string;
  user?: UserAdminItemDTO;
  revokedSessionsCount?: number;
}
