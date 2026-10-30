import { prisma } from "@/core/libs/prisma";
import { LicenseQueryBuilder } from "@/modules/licenses/domain/builders/LicenseQueryBuilder";
import type { LicenseEntity } from "@/modules/licenses/domain/entity/LicenseEntity";
import type {
  AuditLogPayload,
  LicenseQueryParams,
  LicenseRepositoryInterface,
  LicenseStatsResult,
  LicenseWithLogsResult,
  RawLicenseValidationLogRecord,
} from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";

/**
 * Prisma ORM implementation of LicenseRepositoryInterface.
 */
export class LicenseRepository implements LicenseRepositoryInterface {
  public async findBySerialKey(serialKey: string): Promise<LicenseEntity | null> {
    const raw = await prisma.license.findUnique({
      where: { serialKey },
    });

    if (!raw) {
      return null;
    }

    return LicenseMapper.toDomain(raw);
  }

  public async findById(id: string): Promise<LicenseEntity | null> {
    const raw = await prisma.license.findUnique({
      where: { id },
    });

    if (!raw) {
      return null;
    }

    return LicenseMapper.toDomain(raw);
  }

  public async recordAuditLog(audit: AuditLogPayload): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: audit.userId ?? null,
          action: audit.action,
          target: audit.target ?? null,
          details: audit.details ?? null,
          ipAddress: audit.ipAddress ?? null,
        },
      });
    } catch (err) {
      console.error("[LicenseRepository] Failed to record audit log:", err);
    }
  }

  public async save(license: LicenseEntity, audit?: AuditLogPayload): Promise<void> {
    const data = LicenseMapper.toPersistence(license);

    await prisma.license.create({
      data,
    });

    if (audit) {
      await this.recordAuditLog(audit);
    }
  }

  public async update(license: LicenseEntity, audit?: AuditLogPayload): Promise<void> {
    const data = LicenseMapper.toPersistence(license);

    await prisma.license.update({
      where: { id: license.id },
      data: {
        hwid: data.hwid,
        status: data.status,
        expiresAt: data.expiresAt,
        activatedAt: data.activatedAt,
        lastVerifiedAt: data.lastVerifiedAt,
        engineVersion: data.engineVersion,
        updatedAt: new Date(),
      },
    });

    if (audit) {
      await this.recordAuditLog(audit);
    }
  }

  public async findManyPaginated(
    params: LicenseQueryParams,
  ): Promise<{ licenses: LicenseEntity[]; total: number }> {
    const now = new Date();
    const where = LicenseQueryBuilder.buildWhere(params, now);
    const orderBy = LicenseQueryBuilder.buildOrderBy(params.sortBy, params.sortOrder);

    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 10));
    const skip = (page - 1) * limit;

    const [rawRecords, total] = await Promise.all([
      prisma.license.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.license.count({ where }),
    ]);

    const licenses = rawRecords.map((r) => LicenseMapper.toDomain(r));
    return { licenses, total };
  }

  public async getStats(now: Date = new Date()): Promise<LicenseStatsResult> {
    const nowTime = now;
    const thirtyDaysAhead = new Date(nowTime.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(nowTime.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalLicenses,
      activeLicenses,
      expiringSoonLicenses,
      suspendedLicenses,
      expiredStatusLicenses,
      boundDevicesCount,
      unboundActiveCount,
      verifiedLast24hCount,
      hwidMismatchLast24hCount,
    ] = await Promise.all([
      prisma.license.count(),
      prisma.license.count({
        where: {
          status: "ACTIVE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: nowTime } }],
        },
      }),
      prisma.license.count({
        where: {
          status: "ACTIVE",
          expiresAt: {
            gt: nowTime,
            lte: thirtyDaysAhead,
          },
        },
      }),
      prisma.license.count({
        where: { status: "SUSPENDED" },
      }),
      prisma.license.count({
        where: {
          OR: [
            { status: "EXPIRED" },
            {
              status: "ACTIVE",
              expiresAt: { lte: nowTime },
            },
          ],
        },
      }),
      prisma.license.count({
        where: {
          hwid: { not: null },
        },
      }),
      prisma.license.count({
        where: {
          hwid: null,
          status: "ACTIVE",
          OR: [{ expiresAt: null }, { expiresAt: { gt: nowTime } }],
        },
      }),
      prisma.licenseValidationLog.count({
        where: {
          checkedAt: { gte: twentyFourHoursAgo },
          result: { in: ["VERIFIED", "ACTIVATED"] },
        },
      }),
      prisma.licenseValidationLog.count({
        where: {
          checkedAt: { gte: twentyFourHoursAgo },
          result: "HWID_MISMATCH",
        },
      }),
    ]);

    const expiredOrSuspendedLicenses = suspendedLicenses + expiredStatusLicenses;

    return {
      totalLicenses,
      activeLicenses,
      expiringSoonLicenses,
      expiredOrSuspendedLicenses,
      boundDevicesCount,
      unboundActiveCount,
      verifiedLast24hCount,
      hwidMismatchLast24hCount,
    };
  }

  public async findByIdWithRecentLogs(
    id: string,
    logLimit = 10,
  ): Promise<LicenseWithLogsResult | null> {
    const raw = await prisma.license.findUnique({
      where: { id },
      include: {
        validationLogs: {
          orderBy: { checkedAt: "desc" },
          take: logLimit,
        },
      },
    });

    if (!raw) {
      return null;
    }

    const license = LicenseMapper.toDomain(raw);
    const logs: RawLicenseValidationLogRecord[] = raw.validationLogs.map((l) => ({
      id: l.id,
      result: l.result,
      statusCode: l.statusCode,
      hwidHash: l.hwidHash,
      clientIp: l.clientIp,
      engineVersion: l.engineVersion,
      latencyMs: l.latencyMs,
      checkedAt: l.checkedAt,
    }));

    return { license, logs };
  }
}
