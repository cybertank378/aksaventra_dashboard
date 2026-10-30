/* ============================================================
 * DELETE RELEASE USE CASE
 * ============================================================
 */

import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { EngineReleaseRepositoryInterface } from "@/modules/releases/domain/interfaces/ReleaseInterfaces";

export class DeleteReleaseUseCase implements BaseUseCase<{ id: string }, Result<boolean, string>> {
  constructor(private readonly releaseRepo: EngineReleaseRepositoryInterface) {}

  public async execute(params: { id: string }): Promise<Result<boolean, string>> {
    const existing = await this.releaseRepo.findById(params.id);
    if (!existing) {
      return Result.fail("Rilis biner tidak ditemukan.");
    }

    await this.releaseRepo.delete(params.id);
    return Result.ok(true);
  }
}
