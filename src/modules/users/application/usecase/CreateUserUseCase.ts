import { randomUUID } from "node:crypto";
import { Result } from "@/core/domain/Result";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import type { CreateUserDTO } from "@/modules/users/domain/dto/UserRequestDTO";
import type { UserAdminItemDTO } from "@/modules/users/domain/dto/UserResponseDTO";
import { ManagedUserEntity } from "@/modules/users/domain/entity/ManagedUserEntity";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";
import { UserMapper } from "@/modules/users/domain/mapper/UserMapper";

export class CreateUserUseCase {
  constructor(
    private readonly repo: UserRepositoryInterface,
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  public async execute(
    dto: CreateUserDTO,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserAdminItemDTO, Error>> {
    try {
      const email = dto.email.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return Result.fail(new Error("Format email tidak valid"));
      }

      if (!dto.password || dto.password.length < 8) {
        return Result.fail(new Error("Password minimal 8 karakter"));
      }

      const existing = await this.repo.findByEmail(email);
      if (existing) {
        return Result.fail(new Error(`Pengguna dengan email "${email}" sudah terdaftar`));
      }

      const passwordHash = await this.passwordHasher.hash(dto.password);
      const newUser = ManagedUserEntity.create({
        id: randomUUID(),
        name: dto.name?.trim() || email.split("@")[0],
        email,
        role: dto.role,
        isActive: dto.isActive ?? true,
      });

      await this.repo.save(newUser, passwordHash, {
        userId: actorUserId ?? null,
        action: "USER_CREATED",
        target: newUser.id,
        details: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
        }),
        ipAddress: ipAddress ?? null,
      });

      const userDTO = UserMapper.toAdminItemDTO(newUser, 0);
      return Result.ok(userDTO);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat pengguna baru";
      return Result.fail(new Error(message));
    }
  }
}
