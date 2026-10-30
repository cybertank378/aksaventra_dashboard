import { Result } from "@/core/domain/Result";
import type { UserRole } from "@/libs/enums";
import type { LicenseQueryDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { LicenseListResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import type { LicenseRepositoryInterface } from "@/modules/licenses/domain/interfaces/LicenseInterfaces";
import { LicenseMapper } from "@/modules/licenses/domain/mapper/LicenseMapper";

export class ListLicensesUseCase {
  constructor(private readonly repo: LicenseRepositoryInterface) {}

  public async execute(
    query: LicenseQueryDTO,
    role?: UserRole,
  ): Promise<Result<LicenseListResponseDTO, Error>> {
    try {
      const page = Math.max(1, query.page || 1);
      const limit = Math.max(1, Math.min(100, query.limit || 10));

      const { licenses, total } = await this.repo.findManyPaginated({
        page,
        limit,
        search: query.search,
        status: query.status,
        binding: query.binding,
        expiringSoon: query.expiringSoon,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      const now = new Date();
      const adminItems = licenses.map((lic) => LicenseMapper.toAdminDTO(lic, role, now));
      const totalPages = Math.ceil(total / limit) || 1;

      return Result.ok({
        licenses: adminItems,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil daftar lisensi";
      return Result.fail(new Error(message));
    }
  }
}

