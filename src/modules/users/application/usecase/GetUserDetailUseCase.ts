import { Result } from "@/core/domain/Result";
import type { UserDetailResponseDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";

export class GetUserDetailUseCase {
  constructor(private readonly repo: UserRepositoryInterface) {}

  public async execute(id: string): Promise<Result<UserDetailResponseDTO, Error>> {
    try {
      if (!id || id.trim().length === 0) {
        return Result.fail(new Error("ID pengguna wajib diisi"));
      }

      const result = await this.repo.findUserWithDetails(id.trim(), 10);
      if (!result) {
        return Result.fail(new Error(`Pengguna dengan ID "${id}" tidak ditemukan`));
      }

      const now = new Date();
      const detailDTO = UserMapper.toDetailDTO(result, now);
      return Result.ok(detailDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil detail pengguna";
      return Result.fail(new Error(message));
    }
  }
}
