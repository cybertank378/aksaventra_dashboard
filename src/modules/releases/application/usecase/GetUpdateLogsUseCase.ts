/* ============================================================
 * GET UPDATE LOGS USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { UpdateLogQueryDTO } from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { UpdateLogListResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import type { EngineUpdateLogRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export class GetUpdateLogsUseCase
  implements BaseUseCase<UpdateLogQueryDTO, Result<UpdateLogListResponseDTO, string>>
{
  constructor(private readonly logRepo: EngineUpdateLogRepositoryInterface) {}

  public async execute(
    query: UpdateLogQueryDTO,
  ): Promise<Result<UpdateLogListResponseDTO, string>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));

    const { items, total } = await this.logRepo.findMany({
      ...query,
      page,
      limit,
    });

    const responseItems = items.map((log) => {
      const p = log.toPrimitives();
      return {
        id: p.id,
        releaseId: p.releaseId,
        clientVersion: p.clientVersion,
        hwid: p.hwid,
        serialKey: p.serialKey,
        channel: p.channel,
        action: p.action,
        status: p.status,
        clientIp: p.clientIp,
        createdAt: (p.createdAt ?? new Date()).toISOString(),
      };
    });

    return Result.ok({
      items: responseItems,
      total,
      page,
      limit,
    });
  }
}
