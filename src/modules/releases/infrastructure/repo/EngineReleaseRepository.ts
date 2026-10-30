/* ============================================================
 * ENGINE RELEASE REPOSITORY
 * ============================================================
 */

import type { Prisma, ReleaseChannel } from "@prisma/client";
import { prisma } from "@/core/libs/prisma";
import type { ReleaseQueryDTO } from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import type { EngineReleaseRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import { ReleaseMapper } from "@/modules/releases/domain/mapper/ReleaseMapper";
import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export class EngineReleaseRepository implements EngineReleaseRepositoryInterface {
  public async findLatestActive(channel: ReleaseChannelType): Promise<EngineReleaseEntity | null> {
    const record = await prisma.engineRelease.findFirst({
      where: {
        channel: channel as ReleaseChannel,
        isActive: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    if (!record) return null;
    return ReleaseMapper.toReleaseDomain(record);
  }

  public async findByVersion(version: string): Promise<EngineReleaseEntity | null> {
    const record = await prisma.engineRelease.findUnique({
      where: { version },
    });

    if (!record) return null;
    return ReleaseMapper.toReleaseDomain(record);
  }

  public async findById(id: string): Promise<EngineReleaseEntity | null> {
    const record = await prisma.engineRelease.findUnique({
      where: { id },
    });

    if (!record) return null;
    return ReleaseMapper.toReleaseDomain(record);
  }

  public async findMany(
    query: ReleaseQueryDTO,
  ): Promise<{ items: EngineReleaseEntity[]; total: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const skip = (page - 1) * limit;

    const where: Prisma.EngineReleaseWhereInput = {};

    if (query.channel) {
      where.channel = query.channel.toUpperCase() as ReleaseChannel;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { version: { contains: query.search, mode: "insensitive" } },
        { releaseNotes: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.engineRelease.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.engineRelease.count({ where }),
    ]);

    return {
      items: records.map(ReleaseMapper.toReleaseDomain),
      total,
    };
  }

  public async save(release: EngineReleaseEntity): Promise<void> {
    const data = ReleaseMapper.toReleasePersistence(release);
    await prisma.engineRelease.create({ data });
  }

  public async update(release: EngineReleaseEntity): Promise<void> {
    const data = ReleaseMapper.toReleasePersistence(release);
    await prisma.engineRelease.update({
      where: { id: data.id },
      data: {
        channel: data.channel,
        minSupportedVersion: data.minSupportedVersion,
        mandatory: data.mandatory,
        downloadUrl: data.downloadUrl,
        filePath: data.filePath,
        checksumSha256: data.checksumSha256,
        fileSize: data.fileSize,
        releaseNotes: data.releaseNotes,
        isActive: data.isActive,
        downloadCount: data.downloadCount,
        publishedAt: data.publishedAt,
        updatedAt: new Date(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await prisma.engineRelease.delete({
      where: { id },
    });
  }

  public async incrementDownloadCount(id: string): Promise<void> {
    await prisma.engineRelease.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
      },
    });
  }

  public async countStats(): Promise<{
    totalReleases: number;
    activeReleases: number;
    totalDownloads: number;
  }> {
    const [totalReleases, activeReleases, downloadsAggregate] = await Promise.all([
      prisma.engineRelease.count(),
      prisma.engineRelease.count({ where: { isActive: true } }),
      prisma.engineRelease.aggregate({
        _sum: { downloadCount: true },
      }),
    ]);

    return {
      totalReleases,
      activeReleases,
      totalDownloads: downloadsAggregate._sum.downloadCount ?? 0,
    };
  }
}
