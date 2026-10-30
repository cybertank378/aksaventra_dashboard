/* ============================================================
 * CREATE RELEASE USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { CreateReleaseRequestDTO } from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { ReleaseItemResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import { EngineReleaseEntity } from "@/modules/releases/domain/entity/EngineReleaseEntity";
import type { EngineReleaseRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";
import { ReleaseChannelVO } from "@/modules/releases/domain/value-object/ReleaseChannelVO";
import { SemVer } from "@/modules/releases/domain/value-object/SemVer";

export class CreateReleaseUseCase
  implements BaseUseCase<CreateReleaseRequestDTO, Result<ReleaseItemResponseDTO, string>>
{
  constructor(private readonly releaseRepo: EngineReleaseRepositoryInterface) {}

  public async execute(
    dto: CreateReleaseRequestDTO,
  ): Promise<Result<ReleaseItemResponseDTO, string>> {
    if (!SemVer.isValid(dto.version)) {
      return Result.fail(
        `Format versi ${dto.version} tidak valid. Gunakan format SemVer (misal v2.2.2)`,
      );
    }

    if (dto.minSupportedVersion && !SemVer.isValid(dto.minSupportedVersion)) {
      return Result.fail(
        `Format versi minimal ${dto.minSupportedVersion} tidak valid. Gunakan format SemVer`,
      );
    }

    const existing = await this.releaseRepo.findByVersion(dto.version);
    if (existing) {
      return Result.fail(`Rilis versi ${dto.version} sudah terdaftar di sistem.`);
    }

    const channel = ReleaseChannelVO.create(dto.channel).value;
    const now = new Date();

    const entity = EngineReleaseEntity.create({
      id: crypto.randomUUID(),
      version: dto.version,
      channel,
      minSupportedVersion: dto.minSupportedVersion ?? null,
      mandatory: Boolean(dto.mandatory),
      downloadUrl: dto.downloadUrl ?? `/api/v1/updater/download/aksaventra_engine.exe`,
      filePath: dto.filePath ?? null,
      checksumSha256: dto.checksumSha256,
      fileSize: BigInt(dto.fileSize),
      releaseNotes: dto.releaseNotes ?? null,
      isActive: dto.isActive ?? true,
      downloadCount: 0,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await this.releaseRepo.save(entity);

    const p = entity.toPrimitives();
    return Result.ok({
      id: p.id,
      version: p.version,
      channel: p.channel,
      minSupportedVersion: p.minSupportedVersion,
      mandatory: p.mandatory,
      downloadUrl: p.downloadUrl,
      checksumSha256: p.checksumSha256,
      fileSize: Number(p.fileSize),
      releaseNotes: p.releaseNotes,
      isActive: p.isActive,
      downloadCount: p.downloadCount,
      publishedAt: p.publishedAt.toISOString(),
      createdAt: (p.createdAt ?? now).toISOString(),
    });
  }
}
