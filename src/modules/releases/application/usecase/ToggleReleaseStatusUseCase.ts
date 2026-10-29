/* ============================================================
 * TOGGLE RELEASE STATUS USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { EngineReleaseRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export class ToggleReleaseStatusUseCase
  implements BaseUseCase<{ id: string; isActive?: boolean }, Result<boolean, string>>
{
  constructor(private readonly releaseRepo: EngineReleaseRepositoryInterface) {}

  public async execute(params: {
    id: string;
    isActive?: boolean;
  }): Promise<Result<boolean, string>> {
    const release = await this.releaseRepo.findById(params.id);
    if (!release) {
      return Result.fail("Rilis biner tidak ditemukan.");
    }

    if (params.isActive !== undefined) {
      if (params.isActive) {
        release.activate();
      } else {
        release.deactivate();
      }
    } else {
      if (release.isActive) {
        release.deactivate();
      } else {
        release.activate();
      }
    }

    await this.releaseRepo.update(release);
    return Result.ok(release.isActive);
  }
}
