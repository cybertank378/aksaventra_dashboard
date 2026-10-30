import { prisma } from "@/core/libs/prisma";
import { ValidationLogQueryBuilder } from "../../domain/builders/ValidationLogQueryBuilder";
import type {
  ExportValidationLogsQueryDTO,
  ListValidationLogsQueryDTO,
} from "../../domain/dto/ValidationLogRequestDTO";
import type { ValidationLogStatsDTO } from "../../domain/dto/ValidationLogResponseDTO";
import { ValidationLogReadEntity } from "../../domain/entity/ValidationLogReadEntity";
import type {
  ValidationLogRepositoryInterface,
  ValidationLogWithLicenseDetail,
} from "../../domain/interfaces/ValidationLogInterfaces";

export class ValidationLogQueryRepository implements ValidationLogRepositoryInterface {
  public async findManyWithFilter(params: ListValidationLogsQueryDTO): Promise<{
    data: ValidationLogReadEntity[];
    total: number;
  }> {
    const where = ValidationLogQueryBuilder.buildWhereClause(params);
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 15);
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      prisma.licenseValidationLog.findMany({
        where,
        include: {
          license: {
            select: {
              clientName: true,
            },
          },
        },
        orderBy: {
          checkedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.licenseValidationLog.count({ where }),
    ]);

    const data = records.map((record) =>
      ValidationLogReadEntity.create({
        id: record.id,
        licenseId: record.licenseId,
        clientName: record.license?.clientName ?? null,
        serialKeyHint: record.serialKeyHint,
        hwidHash: record.hwidHash,
        result: record.result,
        statusCode: record.statusCode,
        engineVersion: record.engineVersion,
        clientIp: record.clientIp,
        userAgent: record.userAgent,
        latencyMs: record.latencyMs,
        checkedAt: record.checkedAt,
      }),
    );

    return { data, total };
  }

  public async getStats24h(): Promise<ValidationLogStatsDTO> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalRequests24h, verifiedCount24h, hwidMismatchCount24h, rejectedCount24h, avgLatency] =
      await Promise.all([
        prisma.licenseValidationLog.count({
          where: {
            checkedAt: { gte: twentyFourHoursAgo },
          },
        }),
        prisma.licenseValidationLog.count({
          where: {
            checkedAt: { gte: twentyFourHoursAgo },
            result: { in: ["ACTIVATED", "VERIFIED"] },
          },
        }),
        prisma.licenseValidationLog.count({
          where: {
            checkedAt: { gte: twentyFourHoursAgo },
            result: "HWID_MISMATCH",
          },
        }),
        prisma.licenseValidationLog.count({
          where: {
            checkedAt: { gte: twentyFourHoursAgo },
            result: { in: ["EXPIRED", "SUSPENDED", "NOT_FOUND", "BAD_REQUEST"] },
          },
        }),
        prisma.licenseValidationLog.aggregate({
          _avg: {
            latencyMs: true,
          },
          where: {
            checkedAt: { gte: twentyFourHoursAgo },
            latencyMs: { not: null },
          },
        }),
      ]);

    const successRatePercent =
      totalRequests24h > 0
        ? Number(((verifiedCount24h / totalRequests24h) * 100).toFixed(1))
        : 100.0;

    const avgLatencyMs = Math.round(avgLatency._avg.latencyMs ?? 0);

    return {
      totalRequests24h,
      verifiedCount24h,
      successRatePercent,
      hwidMismatchCount24h,
      rejectedCount24h,
      avgLatencyMs,
    };
  }

  public async findById(id: string): Promise<ValidationLogWithLicenseDetail | null> {
    const record = await prisma.licenseValidationLog.findUnique({
      where: { id },
      include: {
        license: {
          select: {
            id: true,
            serialKey: true,
            clientName: true,
            status: true,
            expiresAt: true,
            hwid: true,
          },
        },
      },
    });

    if (!record) {
      return null;
    }

    const log = ValidationLogReadEntity.create({
      id: record.id,
      licenseId: record.licenseId,
      clientName: record.license?.clientName ?? null,
      serialKeyHint: record.serialKeyHint,
      hwidHash: record.hwidHash,
      result: record.result,
      statusCode: record.statusCode,
      engineVersion: record.engineVersion,
      clientIp: record.clientIp,
      userAgent: record.userAgent,
      latencyMs: record.latencyMs,
      checkedAt: record.checkedAt,
    });

    return {
      log,
      license: record.license
        ? {
            id: record.license.id,
            serialKeyHint: record.serialKeyHint,
            clientName: record.license.clientName,
            status: record.license.status,
            expiresAt: record.license.expiresAt,
            currentHwid: record.license.hwid,
          }
        : null,
    };
  }

  public async exportLogs(
    params: ExportValidationLogsQueryDTO,
  ): Promise<ValidationLogReadEntity[]> {
    const where = ValidationLogQueryBuilder.buildWhereClause(params);

    const records = await prisma.licenseValidationLog.findMany({
      where,
      include: {
        license: {
          select: {
            clientName: true,
          },
        },
      },
      orderBy: {
        checkedAt: "desc",
      },
      take: 5000,
    });

    return records.map((record) =>
      ValidationLogReadEntity.create({
        id: record.id,
        licenseId: record.licenseId,
        clientName: record.license?.clientName ?? null,
        serialKeyHint: record.serialKeyHint,
        hwidHash: record.hwidHash,
        result: record.result,
        statusCode: record.statusCode,
        engineVersion: record.engineVersion,
        clientIp: record.clientIp,
        userAgent: record.userAgent,
        latencyMs: record.latencyMs,
        checkedAt: record.checkedAt,
      }),
    );
  }
}
