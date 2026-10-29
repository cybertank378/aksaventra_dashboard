/* ============================================================
 * ENGINE UPDATE LOG REPOSITORY
 * ============================================================
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/core/libs/prisma";
import type { UpdateLogQueryDTO } from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { EngineUpdateLogEntity } from "@/modules/releases/domain/entity/EngineUpdateLogEntity";
import type { EngineUpdateLogRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import { ReleaseMapper } from "@/modules/releases/domain/mapper/ReleaseMapper";

export class EngineUpdateLogRepository implements EngineUpdateLogRepositoryInterface {
  public async record(log: EngineUpdateLogEntity): Promise<void> {
    const p = log.toPrimitives();
    await prisma.engineUpdateLog.create({
      data: {
        id: p.id,
        releaseId: p.releaseId ?? null,
        clientVersion: p.clientVersion,
        hwid: p.hwid ?? null,
        serialKey: p.serialKey ?? null,
        channel: p.channel,
        action: p.action,
        status: p.status,
        clientIp: p.clientIp ?? null,
        userAgent: p.userAgent ?? null,
        createdAt: p.createdAt ?? new Date(),
      },
    });
  }

  public async findMany(
    query: UpdateLogQueryDTO,
  ): Promise<{ items: EngineUpdateLogEntity[]; total: number }> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.EngineUpdateLogWhereInput = {};

    if (query.action) {
      where.action = query.action.toUpperCase();
    }

    if (query.channel) {
      where.channel = query.channel.toLowerCase();
    }

    const [records, total] = await Promise.all([
      prisma.engineUpdateLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.engineUpdateLog.count({ where }),
    ]);

    return {
      items: records.map(ReleaseMapper.toUpdateLogDomain),
      total,
    };
  }

  public async countTodayChecks(): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return prisma.engineUpdateLog.count({
      where: {
        action: "CHECK",
        createdAt: {
          gte: startOfToday,
        },
      },
    });
  }
}
