import { Prisma } from "@prisma/client";
import { prisma } from "@/core/libs/prisma";
import type {
  DashboardRepositoryInterface,
  ExpiringLicenseRecord,
  LicenseStateCounts,
  MonthlyCountRecord,
  PaginatedRecords,
  RecentLicensesQuery,
  ValidationOutcomeBucketRecord,
} from "@/modules/dashboards/domain/interfaces/DashboardInterfaces";
import type {
  RawAuditLogRecord,
  RawLicenseRecord,
} from "@/modules/dashboards/domain/mapper/DashboardMapper";
import type { ChartGranularity } from "@/modules/dashboards/domain/types/ChartGranularity";
import type { DateRange } from "@/modules/dashboards/domain/value-object/DateRange";

export class DashboardRepository implements DashboardRepositoryInterface {
  public async countLicenseStates(now: Date, expiringUntil: Date): Promise<LicenseStateCounts> {
    const [active, expiringSoon, expiredPure, expiredByTime, suspended, activeWithHwid] =
      await Promise.all([
        // Active: status is ACTIVE and (expiresAt IS NULL or expiresAt > now)
        prisma.license.count({
          where: {
            status: "ACTIVE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        }),
        // Expiring Soon: status is ACTIVE and expiresAt is between now and expiringUntil
        prisma.license.count({
          where: {
            status: "ACTIVE",
            expiresAt: { gt: now, lte: expiringUntil },
          },
        }),
        // Expired pure status
        prisma.license.count({
          where: { status: "EXPIRED" },
        }),
        // Expired by time while status was ACTIVE
        prisma.license.count({
          where: {
            status: "ACTIVE",
            expiresAt: { lte: now },
          },
        }),
        // Suspended
        prisma.license.count({
          where: { status: "SUSPENDED" },
        }),
        // Active with HWID bound
        prisma.license.count({
          where: {
            status: "ACTIVE",
            hwid: { not: null },
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        }),
      ]);

    return {
      active,
      expiringSoon,
      expired: expiredPure + expiredByTime,
      suspended,
      activeWithHwid,
    };
  }

  public async countLicensesCreatedBetween(range: DateRange): Promise<number> {
    return prisma.license.count({
      where: {
        createdAt: {
          gte: range.startDate,
          lt: range.endDate,
        },
      },
    });
  }

  public async findExpiringLicenses(
    now: Date,
    expiringUntil: Date,
    limit: number,
  ): Promise<ExpiringLicenseRecord[]> {
    const records = await prisma.license.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: {
          gt: now,
          lte: expiringUntil,
        },
      },
      orderBy: { expiresAt: "asc" },
      take: limit,
      select: {
        id: true,
        clientName: true,
        serialKey: true,
        expiresAt: true,
      },
    });

    return records.map((r) => ({
      id: r.id,
      clientName: r.clientName,
      serialKey: r.serialKey,
      expiresAt: r.expiresAt as Date,
    }));
  }

  public async findRecentLicenses(
    query: RecentLicensesQuery,
    now: Date,
    expiringDays: number = 30,
  ): Promise<PaginatedRecords<RawLicenseRecord>> {
    const expiringUntil = new Date(now.getTime() + expiringDays * 24 * 60 * 60 * 1000);

    // Build Prisma filter depending on selected status tab
    const whereClause: Prisma.LicenseWhereInput = {};

    if (query.status === "ACTIVE") {
      whereClause.status = "ACTIVE";
      whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
    } else if (query.status === "EXPIRING_SOON") {
      whereClause.status = "ACTIVE";
      whereClause.expiresAt = { gt: now, lte: expiringUntil };
    } else if (query.status === "EXPIRED") {
      whereClause.OR = [{ status: "EXPIRED" }, { status: "ACTIVE", expiresAt: { lte: now } }];
    } else if (query.status === "SUSPENDED") {
      whereClause.status = "SUSPENDED";
    }

    const [items, total, allCount, activeCount, expiringCount, expiredCount, suspendedCount] =
      await Promise.all([
        prisma.license.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip: query.offset,
          take: query.limit,
          select: {
            id: true,
            serialKey: true,
            clientName: true,
            status: true,
            hwid: true,
            expiresAt: true,
            engineVersion: true,
            createdAt: true,
          },
        }),
        prisma.license.count({ where: whereClause }),
        prisma.license.count(),
        prisma.license.count({
          where: { status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        }),
        prisma.license.count({
          where: { status: "ACTIVE", expiresAt: { gt: now, lte: expiringUntil } },
        }),
        prisma.license.count({
          where: { OR: [{ status: "EXPIRED" }, { status: "ACTIVE", expiresAt: { lte: now } }] },
        }),
        prisma.license.count({ where: { status: "SUSPENDED" } }),
      ]);

    return {
      items,
      total,
      statusCounts: {
        ALL: allCount,
        ACTIVE: activeCount,
        EXPIRING_SOON: expiringCount,
        EXPIRED: expiredCount,
        SUSPENDED: suspendedCount,
      },
    };
  }

  public async findRecentActivities(limit: number): Promise<RawAuditLogRecord[]> {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        target: true,
        details: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  public async aggregateValidationOutcomes(
    range: DateRange,
    granularity: ChartGranularity,
    timezone: string,
  ): Promise<ValidationOutcomeBucketRecord[]> {
    const truncField = granularity === "week" ? "week" : "day";

    const rows = await prisma.$queryRaw<Array<{ bucket: string; result: string; count: bigint }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC(${Prisma.raw(`'${truncField}'`)}, checked_at AT TIME ZONE ${timezone}), 'YYYY-MM-DD') AS bucket,
        result,
        COUNT(*)::bigint AS count
      FROM license_validation_logs
      WHERE checked_at >= ${range.startDate} AND checked_at <= ${range.endDate}
      GROUP BY bucket, result
      ORDER BY bucket ASC
    `;

    return rows.map((r) => ({
      bucket: r.bucket,
      result: r.result,
      count: Number(r.count),
    }));
  }

  public async aggregateLicensesIssued(
    range: DateRange,
    timezone: string,
  ): Promise<MonthlyCountRecord[]> {
    const rows = await prisma.$queryRaw<Array<{ bucket: string; count: bigint }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE ${timezone}), 'YYYY-MM') AS bucket,
        COUNT(*)::bigint AS count
      FROM licenses
      WHERE created_at >= ${range.startDate} AND created_at <= ${range.endDate}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    return rows.map((r) => ({
      bucket: r.bucket,
      count: Number(r.count),
    }));
  }

  public async aggregateLicensesActivated(
    range: DateRange,
    timezone: string,
  ): Promise<MonthlyCountRecord[]> {
    const rows = await prisma.$queryRaw<Array<{ bucket: string; count: bigint }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', activated_at AT TIME ZONE ${timezone}), 'YYYY-MM') AS bucket,
        COUNT(*)::bigint AS count
      FROM licenses
      WHERE activated_at IS NOT NULL 
        AND activated_at >= ${range.startDate} 
        AND activated_at <= ${range.endDate}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    return rows.map((r) => ({
      bucket: r.bucket,
      count: Number(r.count),
    }));
  }

  public async aggregateLicensesExpiring(
    range: DateRange,
    now: Date,
    timezone: string,
  ): Promise<MonthlyCountRecord[]> {
    const rows = await prisma.$queryRaw<Array<{ bucket: string; count: bigint }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', expires_at AT TIME ZONE ${timezone}), 'YYYY-MM') AS bucket,
        COUNT(*)::bigint AS count
      FROM licenses
      WHERE status = 'ACTIVE'
        AND expires_at IS NOT NULL
        AND expires_at >= ${now}
        AND expires_at <= ${range.endDate}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    return rows.map((r) => ({
      bucket: r.bucket,
      count: Number(r.count),
    }));
  }
}
