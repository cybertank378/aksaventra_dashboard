import { Result } from "@/core/domain/Result";
import type { UserStatsResponseDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";

export class GetUserStatsUseCase {
  constructor(private readonly repo: UserRepositoryInterface) {}

  public async execute(): Promise<Result<UserStatsResponseDTO, Error>> {
    try {
      const stats = await this.repo.getStats();
      const dto = UserMapper.toStatsDTO(stats);
      return Result.ok(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil statistik pengguna";
      return Result.fail(new Error(message));
    }
  }
}
