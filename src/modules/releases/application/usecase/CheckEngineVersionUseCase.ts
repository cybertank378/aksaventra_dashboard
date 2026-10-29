/* ============================================================
 * CHECK ENGINE VERSION USE CASE
 * ============================================================
 *
 * Responsibility:
 * - Compares client SemVer against latest active release
 * - Determines mandatory update status
 * - Records telemetry log
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { CheckVersionRequestDTO } from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { CheckVersionResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import { EngineUpdateLogEntity } from "@/modules/releases/domain/entity/EngineUpdateLogEntity";
import type {
  EngineReleaseRepositoryInterface,
  EngineUpdateLogRepositoryInterface,
} from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import { ReleaseChannelVO } from "@/modules/releases/domain/value-object/ReleaseChannelVO";

export class CheckEngineVersionUseCase
  implements BaseUseCase<CheckVersionRequestDTO, Result<CheckVersionResponseDTO, string>>
{
  constructor(
    private readonly releaseRepo: EngineReleaseRepositoryInterface,
    private readonly logRepo?: EngineUpdateLogRepositoryInterface,
  ) {}

  public async execute(
    dto: CheckVersionRequestDTO,
  ): Promise<Result<CheckVersionResponseDTO, string>> {
    const channelVO = ReleaseChannelVO.create(dto.channel);
    const channel = channelVO.value;

    const latestRelease = await this.releaseRepo.findLatestActive(channel);

    if (!latestRelease) {
      await this.safeRecordLog({
        clientVersion: dto.client_version,
        hwid: dto.hwid,
        serialKey: dto.serial_key,
        channel,
        action: "CHECK",
        status: "SUCCESS",
        clientIp: dto.clientIp,
        userAgent: dto.userAgent,
      });

      return Result.ok({
        status: "success",
        has_update: false,
        latest_version: dto.client_version,
        message: "Tidak ada pembaruan versi yang tersedia.",
      });
    }

    const hasUpdate = latestRelease.hasUpdateFor(dto.client_version);
    const mandatory = hasUpdate ? latestRelease.isMandatoryFor(dto.client_version) : false;

    await this.safeRecordLog({
      releaseId: latestRelease.id,
      clientVersion: dto.client_version,
      hwid: dto.hwid,
      serialKey: dto.serial_key,
      channel,
      action: "CHECK",
      status: "SUCCESS",
      clientIp: dto.clientIp,
      userAgent: dto.userAgent,
    });

    if (hasUpdate) {
      const publishedAtUnix = Math.floor(latestRelease.publishedAt.getTime() / 1000);

      return Result.ok({
        status: "success",
        has_update: true,
        latest_version: latestRelease.version,
        min_supported_version: latestRelease.minSupportedVersion,
        mandatory,
        download_url: latestRelease.downloadUrl ?? "/api/v1/updater/download/aksaventra_engine.exe",
        checksum_sha256: latestRelease.checksumSha256,
        release_notes: latestRelease.releaseNotes,
        published_at: publishedAtUnix,
      });
    }

    return Result.ok({
      status: "success",
      has_update: false,
      latest_version: latestRelease.version,
      message: "Anda sudah menggunakan versi terbaru.",
    });
  }

  private async safeRecordLog(
    props: Parameters<typeof EngineUpdateLogEntity.create>[0],
  ): Promise<void> {
    if (!this.logRepo) return;
    try {
      const log = EngineUpdateLogEntity.create(props);
      await this.logRepo.record(log);
    } catch (err) {
      console.error("[CheckEngineVersionUseCase] Best-effort update log failed:", err);
    }
  }
}
