import { Result } from "@/core/domain/Result";
import type { LiveFeedQueryDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type { LiveFeedListResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import type { EngineMonitorRepositoryInterface } from "@/modules/engine-validation/domain/interfaces/EngineMonitorInterfaces";

export class GetLiveValidationFeedUseCase {
  constructor(private readonly repo: EngineMonitorRepositoryInterface) {}

  public async execute(query?: LiveFeedQueryDTO): Promise<Result<LiveFeedListResponseDTO>> {
    try {
      const normalizedQuery: LiveFeedQueryDTO = {
        page: query?.page && query.page > 0 ? query.page : 1,
        limit: query?.limit && query.limit > 0 ? query.limit : 20,
        group: query?.group ?? "ALL",
        engineVersion: query?.engineVersion,
        search: query?.search,
      };

      const feed = await this.repo.getLiveFeed(normalizedQuery);
      return Result.ok(feed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal mengambil data live validation feed";
      return Result.fail(message);
    }
  }
}
