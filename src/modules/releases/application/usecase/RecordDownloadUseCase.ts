/* ============================================================
 * RECORD DOWNLOAD USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import { EngineUpdateLogEntity } from "@/modules/releases/domain/entity/EngineUpdateLogEntity";
import type {
  EngineReleaseRepositoryInterface,
  EngineUpdateLogRepositoryInterface,
} from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export interface RecordDownloadParams {
  releaseId?: string | null;
  clientVersion: string;
  hwid?: string | null;
  serialKey?: string | null;
  channel?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
}

export class RecordDownloadUseCase
  implements BaseUseCase<RecordDownloadParams, Result<boolean, string>>
{
  constructor(
    private readonly releaseRepo: EngineReleaseRepositoryInterface,
    private readonly logRepo: EngineUpdateLogRepositoryInterface,
  ) {}

  public async execute(params: RecordDownloadParams): Promise<Result<boolean, string>> {
    if (params.releaseId) {
      await this.releaseRepo.incrementDownloadCount(params.releaseId);
    }

    const log = EngineUpdateLogEntity.create({
      releaseId: params.releaseId,
      clientVersion: params.clientVersion,
      hwid: params.hwid,
      serialKey: params.serialKey,
      channel: params.channel ?? "stable",
      action: "DOWNLOAD",
      status: "SUCCESS",
      clientIp: params.clientIp,
      userAgent: params.userAgent,
    });

    await this.logRepo.record(log);
    return Result.ok(true);
  }
}
