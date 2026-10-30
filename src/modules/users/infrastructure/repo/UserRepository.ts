import { prisma } from "@/core/libs/prisma";
import type { UserRole } from "@/libs/enums";
import { UserQueryBuilder } from "@/modules/users/domain/builders/UserQueryBuilder";
import type { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type {
  AuditLogPayload,
  RawLoginAuditRecord,
  RawSessionRecord,
  UserQueryParams,
  UserRepositoryInterface,
  UserStatsResult,
  UserWithDetailsResult,
} from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";

export class UserRepository implements UserRepositoryInterface {
  public async findById(id: string): Promise<ManagedUserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  public async findByEmail(email: string): Promise<ManagedUserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  public async countActiveAdmins(): Promise<number> {
    return await prisma.user.count({
      where: {
        role: "ADMIN",
        isActive: true,
      },
    });
  }

  public async save(
    user: ManagedUserEntity,
    passwordHash: string,
    audit?: AuditLogPayload,
  ): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: persistenceData.id,
          name: persistenceData.name,
          email: persistenceData.email,
          password: passwordHash,
          role: persistenceData.role as "ADMIN" | "OPERATOR" | "AUDITOR",
          isActive: persistenceData.isActive,
          createdAt: persistenceData.createdAt,
          updatedAt: persistenceData.updatedAt,
        },
      });

      if (audit) {
        await tx.auditLog.create({
          data: {
            userId: audit.userId ?? null,
            action: audit.action,
            target: audit.target ?? persistenceData.id,
            details: audit.details ?? null,
            ipAddress: audit.ipAddress ?? null,
          },
        });
      }
    });
  }

  public async update(user: ManagedUserEntity, audit?: AuditLogPayload): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: persistenceData.name,
          email: persistenceData.email,
          role: persistenceData.role as "ADMIN" | "OPERATOR" | "AUDITOR",
          isActive: persistenceData.isActive,
          updatedAt: new Date(),
        },
      });

      if (audit) {
        await tx.auditLog.create({
          data: {
            userId: audit.userId ?? null,
            action: audit.action,
            target: audit.target ?? user.id,
            details: audit.details ?? null,
            ipAddress: audit.ipAddress ?? null,
          },
        });
      }
    });
  }

  public async updateStatusAndRevokeSessions(
    user: ManagedUserEntity,
    revokeSessions: boolean,
    audit?: AuditLogPayload,
  ): Promise<void> {
    const persistenceData = UserMapper.toPersistence(user);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isActive: persistenceData.isActive,
          updatedAt: new Date(),
        },
      });

      if (revokeSessions) {
        await tx.session.deleteMany({
          where: { userId: user.id },
        });
      }

      if (audit) {
        await tx.auditLog.create({
          data: {
            userId: audit.userId ?? null,
            action: audit.action,
            target: audit.target ?? user.id,
            details: audit.details ?? null,
            ipAddress: audit.ipAddress ?? null,
          },
        });
      }
    });
  }

  public async findManyPaginated(
    params: UserQueryParams,
  ): Promise<{ users: ManagedUserEntity[]; total: number; sessionCounts: Map<string, number> }> {
    const where = UserQueryBuilder.buildWhere(params);
    const orderBy = UserQueryBuilder.buildOrderBy(params.sortBy, params.sortOrder);

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const [rawUsers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const userIds = rawUsers.map((u) => u.id);
    const sessionCounts = new Map<string, number>();

    if (userIds.length > 0) {
      const activeSessions = await prisma.session.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          expiresAt: { gt: new Date() },
        },
        _count: {
          id: true,
        },
      });

      for (const group of activeSessions) {
        sessionCounts.set(group.userId, group._count.id);
      }
    }

    const users = rawUsers.map((u) => UserMapper.toDomain(u));

    return {
      users,
      total,
      sessionCounts,
    };
  }

  public async getStats(): Promise<UserStatsResult> {
    const now = new Date();

    const [totalUsers, activeUsers, roleAggregations, activeSessionsCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ["role"],
        _count: {
          id: true,
        },
      }),
      prisma.session.count({
        where: {
          expiresAt: { gt: now },
        },
      }),
    ]);

    const roleCounts: Record<UserRole, number> = {
      ADMIN: 0,
      OPERATOR: 0,
      AUDITOR: 0,
    };

    for (const group of roleAggregations) {
      if (group.role in roleCounts) {
        roleCounts[group.role as UserRole] = group._count.id;
      }
    }

    return {
      totalUsers,
      activeUsers,
      lockedOrInactiveUsers: totalUsers - activeUsers,
      activeSessionsCount,
      roleCounts,
    };
  }

  public async findUserWithDetails(
    id: string,
    auditLimit: number = 10,
  ): Promise<UserWithDetailsResult | null> {
    const now = new Date();

    const [userRaw, sessionsRaw, auditsRaw] = await Promise.all([
      prisma.user.findUnique({
        where: { id },
      }),
      prisma.session.findMany({
        where: {
          userId: id,
          expiresAt: { gt: now },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      }),
      prisma.auditLog.findMany({
        where: {
          target: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: Math.max(1, Math.min(50, auditLimit)),
      }),
    ]);

    if (!userRaw) {
      return null;
    }

    const user = UserMapper.toDomain(userRaw);

    const activeSessions: RawSessionRecord[] = sessionsRaw.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));

    const recentLoginAudits: RawLoginAuditRecord[] = auditsRaw.map((a) => {
      let failureReason: string | null = null;
      let status = "SUCCESS";

      if (a.details) {
        try {
          const parsed = JSON.parse(a.details);
          if (parsed.failureReason) failureReason = parsed.failureReason;
          if (parsed.status) status = parsed.status;
        } catch {
          // Non-JSON details
        }
      }

      if (a.action.includes("FAILED") || a.action.includes("LOCK")) {
        status = "FAILED";
      }

      return {
        id: a.id,
        status,
        ipAddress: a.ipAddress,
        userAgent: null,
        failureReason,
        createdAt: a.createdAt,
      };
    });

    return {
      user,
      activeSessions,
      recentLoginAudits,
    };
  }

  public async revokeAllSessions(userId: string, audit?: AuditLogPayload): Promise<number> {
    return await prisma.$transaction(async (tx) => {
      const deleteResult = await tx.session.deleteMany({
        where: { userId },
      });

      if (audit) {
        await tx.auditLog.create({
          data: {
            userId: audit.userId ?? null,
            action: audit.action,
            target: audit.target ?? userId,
            details: audit.details ?? null,
            ipAddress: audit.ipAddress ?? null,
          },
        });
      }

      return deleteResult.count;
    });
  }
}
