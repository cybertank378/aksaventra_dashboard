import type { User as PrismaUser, UserRole as PrismaUserRole } from "@prisma/client";
import type { UserRole } from "@/libs/enums";
import type {
  UserActiveSessionDTO,
  UserAdminItemDTO,
  UserDetailResponseDTO,
  UserLoginAuditDTO,
  UserStatsResponseDTO,
} from "@/modules/users/domain/dto/UserResponseDTO";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type {
  RawLoginAuditRecord,
  RawSessionRecord,
  UserStatsResult,
  UserWithDetailsResult,
} from "@/modules/users/domain/interfaces/UserInterfaces";

export class UserMapper {
  public static toDomain(record: PrismaUser): ManagedUserEntity {
    return ManagedUserEntity.create({
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role as UserRole,
      isActive: record.isActive,
      lastLoginAt: record.lastLoginAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  public static toPersistence(entity: ManagedUserEntity): {
    id: string;
    email: string;
    name: string | null;
    role: PrismaUserRole;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    const primitives = entity.toPrimitives();
    return {
      id: primitives.id,
      email: primitives.email,
      name: primitives.name ?? null,
      role: primitives.role as PrismaUserRole,
      isActive: primitives.isActive,
      lastLoginAt: primitives.lastLoginAt ?? null,
      createdAt: primitives.createdAt ?? new Date(),
      updatedAt: primitives.updatedAt ?? new Date(),
    };
  }

  public static toAdminItemDTO(
    entity: ManagedUserEntity,
    activeSessionsCount = 0,
    now: Date = new Date(),
  ): UserAdminItemDTO {
    const primitives = entity.toPrimitives();
    const accountState = entity.getAccountState(now);

    return {
      id: primitives.id,
      name: primitives.name || primitives.email.split("@")[0] || "User",
      email: primitives.email,
      role: primitives.role,
      isActive: primitives.isActive,
      accountState,
      isEmailVerified: true,
      failedLoginAttempts: primitives.failedLoginAttempts ?? 0,
      lockedUntil: primitives.lockedUntil ? primitives.lockedUntil.toISOString() : null,
      activeSessionsCount,
      lastLoginAt: primitives.lastLoginAt ? primitives.lastLoginAt.toISOString() : null,
      createdAt: (primitives.createdAt ?? new Date()).toISOString(),
    };
  }

  public static toSessionDTO(raw: RawSessionRecord): UserActiveSessionDTO {
    let deviceInfo: string | null = null;
    if (raw.userAgent) {
      if (raw.userAgent.includes("Windows")) deviceInfo = "Windows PC";
      else if (raw.userAgent.includes("Mac")) deviceInfo = "macOS";
      else if (raw.userAgent.includes("Linux")) deviceInfo = "Linux";
      else if (raw.userAgent.includes("Android")) deviceInfo = "Android Device";
      else if (raw.userAgent.includes("iPhone")) deviceInfo = "iPhone";
      else deviceInfo = "Browser Web";
    }

    return {
      id: raw.id,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      deviceInfo,
      createdAt: raw.createdAt.toISOString(),
      expiresAt: raw.expiresAt.toISOString(),
    };
  }

  public static toLoginAuditDTO(raw: RawLoginAuditRecord): UserLoginAuditDTO {
    return {
      id: raw.id,
      status: raw.status,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      failureReason: raw.failureReason,
      createdAt: raw.createdAt.toISOString(),
    };
  }

  public static toDetailDTO(
    details: UserWithDetailsResult,
    now: Date = new Date(),
  ): UserDetailResponseDTO {
    const baseItem = UserMapper.toAdminItemDTO(details.user, details.activeSessions.length, now);

    return {
      ...baseItem,
      activeSessions: details.activeSessions.map(UserMapper.toSessionDTO),
      recentLoginAudits: details.recentLoginAudits.map(UserMapper.toLoginAuditDTO),
    };
  }

  public static toStatsDTO(stats: UserStatsResult): UserStatsResponseDTO {
    return {
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      lockedOrInactiveUsers: stats.lockedOrInactiveUsers,
      activeSessionsCount: stats.activeSessionsCount,
      roleCounts: stats.roleCounts,
    };
  }
}
