import { Result } from "@/core/domain/Result";
import type { ListUsersQueryDTO } from "@/modules/users/domain/dto/UserRequestDTO";
import type { UserListResponseDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";

export class ListUsersUseCase {
  constructor(private readonly repo: UserRepositoryInterface) {}

  public async execute(query: ListUsersQueryDTO): Promise<Result<UserListResponseDTO, Error>> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.max(1, Math.min(100, query.limit || 10));

      const { users, total, sessionCounts } = await this.repo.findManyPaginated({
        page,
        limit,
        search: query.search,
        role: query.role,
        accountState: query.accountState,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      const now = new Date();
      const userDTOs = users.map((user) => {
        const activeSessionsCount = sessionCounts.get(user.id) ?? 0;
        return UserMapper.toAdminItemDTO(user, activeSessionsCount, now);
      });

      const totalPages = Math.ceil(total / limit) || 1;

      return Result.ok({
        users: userDTOs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil daftar pengguna";
      return Result.fail(new Error(message));
    }
  }
}
