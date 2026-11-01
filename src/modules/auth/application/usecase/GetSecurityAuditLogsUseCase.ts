import type { Prisma } from "@prisma/client";
import { prisma } from "@/core/libs/prisma";
import type {
  SecurityAuditItemDTO,
  SecurityAuditQueryParamsDTO,
  SecurityAuditResponseDTO,
  SecurityAuditSummaryDTO,
} from "@/modules/auth/domain/dto/SecurityAuditDTO";

export class GetSecurityAuditLogsUseCase {
  public async execute(
    params: SecurityAuditQueryParamsDTO = {},
  ): Promise<SecurityAuditResponseDTO> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 10));
    const skip = (page - 1) * limit;
    const tab = params.tab ?? "audit_logs";
    const search = params.search?.trim();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Compute KPI metrics in parallel
    const [totalAdminActions30d, loginSuccess24h, loginFailedAttempts, criticalMutationsCount] =
      await Promise.all([
        prisma.auditLog.count({
          where: {
            createdAt: { gte: thirtyDaysAgo },
            NOT: { action: { startsWith: "LOGIN" } },
          },
        }),
        prisma.auditLog.count({
          where: {
            createdAt: { gte: twentyFourHoursAgo },
            action: "LOGIN_SUCCESS",
          },
        }),
        prisma.auditLog.count({
          where: {
            action: { in: ["LOGIN_FAILED", "SUSPICIOUS_LOGIN", "ACCOUNT_LOCKED"] },
          },
        }),
        prisma.auditLog.count({
          where: {
            action: {
              in: [
                "SETTINGS_UPDATED",
                "LICENSE_HWID_RESET",
                "LICENSE_SUSPENDED",
                "LICENSE_REVOKED",
                "ENGINE_RELEASE_CREATED",
                "ENGINE_REVOKED",
                "USER_DEACTIVATED",
              ],
            },
          },
        }),
      ]);

    const summary: SecurityAuditSummaryDTO = {
      totalAdminActions30d,
      loginSuccess24h,
      loginFailedAttempts,
      criticalMutationsCount,
    };

    // Build query conditions
    const whereConditions: Prisma.AuditLogWhereInput[] = [];

    if (tab === "login_audits") {
      whereConditions.push({
        action: {
          in: [
            "LOGIN_SUCCESS",
            "LOGIN_FAILED",
            "SUSPICIOUS_LOGIN",
            "ACCOUNT_LOCKED",
            "LOGOUT",
            "LOGOUT_ALL",
          ],
        },
      });
    } else {
      whereConditions.push({
        NOT: { action: { in: ["LOGIN_SUCCESS", "LOGOUT"] } },
      });
    }

    if (search && search.length > 0) {
      whereConditions.push({
        OR: [
          { action: { contains: search, mode: "insensitive" } },
          { target: { contains: search, mode: "insensitive" } },
          { details: { contains: search, mode: "insensitive" } },
          { ipAddress: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    const where: Prisma.AuditLogWhereInput =
      whereConditions.length > 0 ? { AND: whereConditions } : {};

    const [total, records] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const logs: SecurityAuditItemDTO[] = records.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user?.name ?? r.user?.email ?? "Sistem",
      userRole: r.user?.role ?? "SYSTEM",
      action: r.action,
      target: r.target,
      details: r.details,
      ipAddress: r.ipAddress,
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      logs,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      summary,
    };
  }
}
