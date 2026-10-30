import { Result } from "@/core/domain/Result";
import type { UpdateUserDTO } from "@/modules/users/domain/dto/UserRequestDTO";
import type { UserAdminItemDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";
import { SelfProtectionRule } from "@/modules/users/domain/rules/SelfProtectionRule";

export class UpdateUserUseCase {
  constructor(private readonly repo: UserRepositoryInterface) {}

  public async execute(
    id: string,
    dto: UpdateUserDTO,
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

      // Enforce SelfProtectionRule against self-demotion & last-admin loss
      if (dto.role) {
        const roleEvaluation = SelfProtectionRule.validateRoleChange(
          actorUserId,
          targetUser,
          dto.role,
          totalActiveAdmins,
        );

        if (!roleEvaluation.isAllowed) {
          return Result.fail(new Error(roleEvaluation.reason || "Perubahan role tidak diizinkan"));
        }
      }

      // Check if email already used by someone else
      if (dto.email) {
        const newEmail = dto.email.trim().toLowerCase();
        if (newEmail !== targetUser.email) {
          const emailHolder = await this.repo.findByEmail(newEmail);
          if (emailHolder && emailHolder.id !== targetUser.id) {
            return Result.fail(new Error(`Email "${newEmail}" sudah digunakan oleh pengguna lain`));
          }
        }
      }

      const previousData = {
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      };

      if (dto.name !== undefined || dto.email !== undefined) {
        targetUser.updateProfile(dto.name, dto.email);
      }

      if (dto.role && dto.role !== targetUser.role) {
        targetUser.changeRole(dto.role);
      }

      await this.repo.update(targetUser, {
        userId: actorUserId ?? null,
        action: "USER_UPDATED",
        target: targetUser.id,
        details: JSON.stringify({
          before: previousData,
          after: {
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role,
          },
        }),
        ipAddress: ipAddress ?? null,
      });

      const userDTO = UserMapper.toAdminItemDTO(targetUser);
      return Result.ok(userDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui pengguna";
      return Result.fail(new Error(message));
    }
  }
}
