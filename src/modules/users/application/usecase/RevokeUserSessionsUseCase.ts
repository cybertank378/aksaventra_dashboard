import { Result } from "@/core/domain/Result";
import type { UserMutationResponseDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";

export class RevokeUserSessionsUseCase {
  constructor(private readonly repo: UserRepositoryInterface) {}

  public async execute(
    userId: string,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserMutationResponseDTO, Error>> {
    try {
      if (!userId || userId.trim().length === 0) {
        return Result.fail(new Error("ID pengguna wajib diisi"));
      }

      const targetUser = await this.repo.findById(userId.trim());
      if (!targetUser) {
        return Result.fail(new Error(`Pengguna dengan ID "${userId}" tidak ditemukan`));
      }

      const count = await this.repo.revokeAllSessions(targetUser.id, {
        userId: actorUserId ?? null,
        action: "USER_SESSIONS_REVOKED",
        target: targetUser.id,
        details: JSON.stringify({
          message: "Seluruh sesi perangkat aktif berhasil dicabut oleh administrator",
        }),
        ipAddress: ipAddress ?? null,
      });

      return Result.ok({
        success: true,
        message: `Berhasil mencabut ${count} sesi aktif untuk pengguna ${targetUser.email}`,
        revokedSessionsCount: count,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mencabut sesi aktif";
      return Result.fail(new Error(message));
    }
  }
}
