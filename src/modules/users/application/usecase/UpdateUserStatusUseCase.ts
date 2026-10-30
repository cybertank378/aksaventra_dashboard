import { Result } from "@/core/domain/Result";
import type { UpdateUserStatusDTO } from "@/modules/users/domain/dto/UserRequestDTO";
import type { UserAdminItemDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";
import { SelfProtectionRule } from "@/modules/users/domain/rules/SelfProtectionRule";

export class UpdateUserStatusUseCase {
  constructor(private readonly repo: UserRepositoryInterface) {}

  public async execute(
    id: string,
    dto: UpdateUserStatusDTO,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserAdminItemDTO, Error>> {
    try {
      if (!id || id.trim().length === 0) {
        return Result.fail(new Error("ID pengguna wajib diisi"));
      }

      const targetUser = await this.repo.findById(id.trim());
      if (!targetUser) {
        return Result.fail(new Error(`Pengguna dengan ID "${id}" tidak ditemukan`));
      }

      const totalActiveAdmins = await this.repo.countActiveAdmins();

      // Enforce SelfProtectionRule against self-lockout & last-admin loss
      if (dto.isActive !== undefined) {
        const statusEvaluation = SelfProtectionRule.validateStatusChange(
          actorUserId,
          targetUser,
          dto.isActive,
          totalActiveAdmins,
        );

        if (!statusEvaluation.isAllowed) {
          return Result.fail(
            new Error(statusEvaluation.reason || "Perubahan status akun tidak diizinkan"),
          );
        }
      }

      const previousState = {
        isActive: targetUser.isActive,
        isLocked: targetUser.isLocked(),
      };

      let shouldRevokeSessions = false;

      if (dto.isActive !== undefined) {
        if (dto.isActive) {
          targetUser.activate();
        } else {
          targetUser.deactivate();
          shouldRevokeSessions = true; // Auto revoke sessions when deactivated!
        }
      }

      if (dto.unlock) {
        targetUser.unlock();
      }

      await this.repo.updateStatusAndRevokeSessions(targetUser, shouldRevokeSessions, {
        userId: actorUserId ?? null,
        action: "USER_STATUS_UPDATED",
        target: targetUser.id,
        details: JSON.stringify({
          before: previousState,
          after: {
            isActive: targetUser.isActive,
            isLocked: targetUser.isLocked(),
          },
          reason: dto.reason?.trim() || "Pembaruan status operasional akun",
        }),
        ipAddress: ipAddress ?? null,
      });

      const userDTO = UserMapper.toAdminItemDTO(targetUser);
      return Result.ok(userDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui status akun";
      return Result.fail(new Error(message));
    }
  }
}
