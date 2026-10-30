/* ============================================================
 * GET LATEST RELEASE USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import type { EngineReleaseRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import {
  type ReleaseChannelType,
  ReleaseChannelVO,
} from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export class GetLatestReleaseUseCase
  implements BaseUseCase<{ channel?: string }, Result<EngineReleaseEntity, string>>
{
  constructor(private readonly releaseRepo: EngineReleaseRepositoryInterface) {}

  public async execute(params: { channel?: string }): Promise<Result<EngineReleaseEntity, string>> {
    const channel: ReleaseChannelType = ReleaseChannelVO.create(params.channel).value;
    const release = await this.releaseRepo.findLatestActive(channel);

    if (!release) {
      return Result.fail(`Tidak ditemukan biner aktif untuk channel ${channel}`);
    }

    return Result.ok(release);
  }
}
