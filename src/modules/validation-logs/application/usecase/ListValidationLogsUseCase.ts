import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { ListValidationLogsQueryDTO } from "../../domain/dto/ValidationLogRequestDTO";
import type { ValidationLogListResponseDTO } from "../../domain/dto/ValidationLogResponseDTO";
import type { ValidationLogRepositoryInterface } from "../../domain/interfaces/ValidationLogInterfaces";
import { ValidationLogMapper } from "../../domain/mapper/ValidationLogMapper";
import { DEFAULT_VALIDATION_LOG_PAGE_LIMIT } from "../../shared/constants/validationLogConstants";

export class ListValidationLogsUseCase
  implements BaseUseCase<ListValidationLogsQueryDTO, Result<ValidationLogListResponseDTO, string>>
{
  constructor(private readonly repo: ValidationLogRepositoryInterface) {}

  public async execute(
    params: ListValidationLogsQueryDTO = {},
  ): Promise<Result<ValidationLogListResponseDTO, string>> {
    try {
      const page = Math.max(1, params.page ?? 1);
      const limit = Math.min(100, Math.max(1, params.limit ?? DEFAULT_VALIDATION_LOG_PAGE_LIMIT));

      const { data, total } = await this.repo.findManyWithFilter({
        ...params,
        page,
        limit,
      });

      const totalPages = Math.ceil(total / limit) || 1;

      return Result.ok({
        logs: ValidationLogMapper.toDTOList(data),
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memuat daftar log validasi";
      return Result.fail(message);
    }
  }
}
