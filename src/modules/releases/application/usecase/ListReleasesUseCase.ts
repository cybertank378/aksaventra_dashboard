/* ============================================================
 * LIST RELEASES USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ReleaseQueryDTO } from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type { ReleaseListResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import type { EngineReleaseRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export class ListReleasesUseCase
  implements BaseUseCase<ReleaseQueryDTO, Result<ReleaseListResponseDTO, string>>
{
  constructor(private readonly releaseRepo: EngineReleaseRepositoryInterface) {}

  public async execute(query: ReleaseQueryDTO): Promise<Result<ReleaseListResponseDTO, string>> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));

    const { items, total } = await this.releaseRepo.findMany({
      ...query,
      page,
      limit,
    });

    const responseItems = items.map((entity) => {
      const p = entity.toPrimitives();
      return {
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
        createdAt: (p.createdAt ?? new Date()).toISOString(),
      };
    });

    return Result.ok({
      items: responseItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }
}
