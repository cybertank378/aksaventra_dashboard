import type { Prisma } from "@prisma/client";
import { prisma } from "@/core/libs/prisma";
import { LiveFeedQueryBuilder } from "@/modules/engine-validation/domain/builders/LiveFeedQueryBuilder";
import type {
  LiveFeedQueryDTO,
  PatchBinaryStatusDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type {
  BinaryIntegrityItemDTO,
  EngineMonitorSummaryResponseDTO,
  LiveFeedListResponseDTO,
  PatchBinaryStatusResponseDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type {
  EngineMonitorRepositoryInterface,
  RawReleaseRecord,
  RawValidationLogRecord,
} from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";
import { EngineMonitorMapper } from "@/modules/engine-validation/domain/mapper/EngineMonitorMapper";
import { SlaComplianceRule } from "@/modules/engine-validation/domain/rules/SlaComplianceRule";

export class EngineMonitorRepository implements EngineMonitorRepositoryInterface {
  public async getSummaryMetrics(): Promise<EngineMonitorSummaryResponseDTO> {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [requestsLast15m, anomaliesLast1h, onlineDevices24h, logs24h, latestReleaseRaw] =
      await Promise.all([
        // 1. Throughput 15 Menit Terakhir
        prisma.licenseValidationLog.count({
          where: {
            checkedAt: {
              gte: fifteenMinutesAgo,
            },
          },
        }),

        // 2. Anomali & Mismatch 1 Jam Terakhir
        prisma.licenseValidationLog.count({
          where: {
            checkedAt: {
              gte: oneHourAgo,
            },
            OR: [
              { statusCode: 403 },
              { result: "HWID_MISMATCH" },
              { statusCode: 401 },
              { result: { in: ["EXPIRED", "SUSPENDED", "NOT_FOUND"] } },
            ],
          },
        }),

        // 3. Mesin/Lisensi Aktif dalam 24 Jam
        prisma.license.count({
          where: {
            lastVerifiedAt: {
              gte: twentyFourHoursAgo,
            },
          },
        }),

        // 4. Riwayat Log 24 Jam untuk Distribusi SLA, Latensi & Versi Klien
        prisma.licenseValidationLog.findMany({
          where: {
            checkedAt: {
              gte: twentyFourHoursAgo,
            },
          },
          select: {
            latencyMs: true,
            result: true,
            statusCode: true,
            engineVersion: true,
          },
          orderBy: {
            checkedAt: "desc",
          },
          take: 5000,
        }),

        // 5. Rilis Engine Aktif Terbaru
        prisma.engineRelease.findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        }),
      ]);

    // Throughput rate per minute
    const requestsPerMinuteRate = Math.round((requestsLast15m / 15) * 10) / 10;

    // Kalkulasi Latensi SLA
    const latencies = logs24h.map((l) => l.latencyMs);
    const slaMetrics = SlaComplianceRule.calculate(latencies);

    // Breakdown Hasil Validasi 24 Jam
    let verifiedCount = 0;
    let activatedCount = 0;
    let mismatchCount = 0;
    let rejectedCount = 0;

    // Distribusi Versi Engine Klien
    const versionMap = new Map<string, number>();

    for (const log of logs24h) {
      if (log.result === "VERIFIED") {
        verifiedCount++;
      } else if (log.result === "ACTIVATED") {
        activatedCount++;
      } else if (log.result === "HWID_MISMATCH" || log.statusCode === 403) {
        mismatchCount++;
      } else {
        rejectedCount++;
      }

      if (log.engineVersion && log.engineVersion.trim() !== "") {
        const v = log.engineVersion.trim();
        versionMap.set(v, (versionMap.get(v) || 0) + 1);
      }
    }

    const totalLogs = logs24h.length;
    const clientVersionDistribution: Array<{
      engineVersion: string;
      deviceCount: number;
      percent: number;
      isLatestStable: boolean;
    }> = [];

    const latestStableVersion = latestReleaseRaw?.version ?? null;

    versionMap.forEach((count, version) => {
      const percent = totalLogs > 0 ? Math.round((count / totalLogs) * 1000) / 10 : 0;
      clientVersionDistribution.push({
        engineVersion: version,
        deviceCount: count,
        percent,
        isLatestStable: version === latestStableVersion,
      });
    });

    clientVersionDistribution.sort((a, b) => b.deviceCount - a.deviceCount);

    return {
      requestsLast15m,
      requestsPerMinuteRate,
      avgLatencyMs24h: slaMetrics.avgLatencyMs,
      p95LatencyMs24h: slaMetrics.p95LatencyMs,
      slaCompliancePercent24h: slaMetrics.compliancePercent,
      onlineDevices24h,
      anomaliesLast1h,
      outcomeBreakdown24h: {
        verifiedCount,
        activatedCount,
        mismatchCount,
        rejectedCount,
        totalCount: totalLogs,
      },
      clientVersionDistribution,
      latestActiveRelease: latestReleaseRaw
        ? {
            version: latestReleaseRaw.version,
            channel: latestReleaseRaw.channel,
            checksumSha256: latestReleaseRaw.checksumSha256,
            publishedAt: latestReleaseRaw.publishedAt.toISOString(),
          }
        : null,
    };
  }

  public async getLiveFeed(query: LiveFeedQueryDTO): Promise<LiveFeedListResponseDTO> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where = LiveFeedQueryBuilder.buildWhere(query) as Prisma.LicenseValidationLogWhereInput;

    const [logs, totalItems] = await Promise.all([
      prisma.licenseValidationLog.findMany({
        where,
        include: {
          license: {
            select: {
              clientName: true,
              serialKey: true,
            },
          },
        },
        orderBy: {
          checkedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.licenseValidationLog.count({
        where,
      }),
    ]);

    const items = logs.map((log) =>
      EngineMonitorMapper.toLiveFeedItemDTO(log as RawValidationLogRecord),
    );
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  public async listBinaryReleases(): Promise<BinaryIntegrityItemDTO[]> {
    const releases = await prisma.engineRelease.findMany({
      orderBy: {
        publishedAt: "desc",
      },
    });

    return releases.map((release) =>
      EngineMonitorMapper.toBinaryIntegrityDTO({
        id: release.id,
        version: release.version,
        channel: release.channel,
        checksumSha256: release.checksumSha256,
        fileSize: Number(release.fileSize),
        isActive: release.isActive,
        downloadCount: release.downloadCount,
        publishedAt: release.publishedAt,
        createdAt: release.createdAt,
        updatedAt: release.updatedAt,
      }),
    );
  }

  public async findBinaryReleaseByVersion(version: string): Promise<RawReleaseRecord | null> {
    const release = await prisma.engineRelease.findUnique({
      where: {
        version,
      },
    });

    if (!release) {
      return null;
    }

    return {
      id: release.id,
      version: release.version,
      channel: release.channel,
      checksumSha256: release.checksumSha256,
      fileSize: Number(release.fileSize),
      isActive: release.isActive,
      downloadCount: release.downloadCount,
      publishedAt: release.publishedAt,
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
    };
  }

  public async findBinaryReleaseById(id: string): Promise<RawReleaseRecord | null> {
    const release = await prisma.engineRelease.findUnique({
      where: {
        id,
      },
    });

    if (!release) {
      return null;
    }

    return {
      id: release.id,
      version: release.version,
      channel: release.channel,
      checksumSha256: release.checksumSha256,
      fileSize: Number(release.fileSize),
      isActive: release.isActive,
      downloadCount: release.downloadCount,
      publishedAt: release.publishedAt,
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
    };
  }

  public async updateBinaryStatus(
    dto: PatchBinaryStatusDTO,
    actorId?: string,
  ): Promise<PatchBinaryStatusResponseDTO> {
    const updated = await prisma.$transaction(async (tx) => {
      const release = await tx.engineRelease.update({
        where: { id: dto.id },
        data: {
          isActive: dto.isActive,
        },
      });

      if (actorId) {
        await tx.auditLog.create({
          data: {
            userId: actorId,
            action: dto.isActive ? "ACTIVATE_ENGINE_BINARY" : "REVOKE_ENGINE_BINARY",
            target: `EngineRelease:${dto.id}`,
            details: JSON.stringify({
              version: release.version,
              isActive: dto.isActive,
              reason: dto.reason || "Manual status toggle by administrator",
            }),
          },
        });
      }

      return release;
    });

    return {
      id: updated.id,
      version: updated.version,
      isActive: updated.isActive,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
