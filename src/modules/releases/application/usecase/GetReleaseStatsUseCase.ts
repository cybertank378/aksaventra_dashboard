/* ============================================================
 * GET RELEASE STATS USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ReleaseStatsResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import type {
  EngineReleaseRepositoryInterface,
  EngineUpdateLogRepositoryInterface,
} from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export class GetReleaseStatsUseCase
  implements BaseUseCase<void, Result<ReleaseStatsResponseDTO, string>>
{
  constructor(
    private readonly releaseRepo: EngineReleaseRepositoryInterface,
    private readonly logRepo: EngineUpdateLogRepositoryInterface,
  ) {}

  public async execute(): Promise<Result<ReleaseStatsResponseDTO, string>> {
    const { totalReleases, activeReleases, totalDownloads } = await this.releaseRepo.countStats();
    const checksToday = await this.logRepo.countTodayChecks();

    return Result.ok({
      totalReleases,
      activeReleases,
      totalDownloads,
      checksToday,
    });
  }
}
