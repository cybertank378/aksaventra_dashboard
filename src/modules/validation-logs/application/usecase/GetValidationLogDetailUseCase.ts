import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ValidationLogDetailResponseDTO } from "../../domain/dto/ValidationLogResponseDTO";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";
import { ValidationLogMapper } from "../../domain/mapper/ValidationLogMapper";

export interface GetValidationLogDetailInput {
  id: string;
}

export class GetValidationLogDetailUseCase
  implements
    BaseUseCase<GetValidationLogDetailInput, Result<ValidationLogDetailResponseDTO, string>>
{
  constructor(private readonly repo: ValidationLogRepositoryInterface) {}

  public async execute(
    input: GetValidationLogDetailInput,
  ): Promise<Result<ValidationLogDetailResponseDTO, string>> {
    try {
      if (!input?.id || input.id.trim() === "") {
        return Result.fail("ID log validasi wajib diisi");
      }

      const detail = await this.repo.findById(input.id.trim());

      if (!detail) {
        return Result.fail("Log validasi tidak ditemukan");
      }

      const logDTO = ValidationLogMapper.toItemDTO(detail.log);

      return Result.ok({
        log: logDTO,
        license: detail.license
          ? {
              id: detail.license.id,
              serialKeyHint: detail.license.serialKeyHint,
              clientName: detail.license.clientName,
              status: detail.license.status,
              expiresAt: detail.license.expiresAt ? detail.license.expiresAt.toISOString() : null,
              currentHwid: detail.license.currentHwid,
            }
          : null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memuat rincian log validasi";
      return Result.fail(message);
    }
  }
}
