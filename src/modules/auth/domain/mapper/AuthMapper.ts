import type { User as PrismaUser } from "@prisma/client";
import type { UserRole } from "@/libs/enums";
import type { AuthUserResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";

export class AuthMapper {
  public static toDomain(raw: PrismaUser): UserCredentialEntity {
    return UserCredentialEntity.create({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.password,
      name: raw.name,
      role: raw.role as UserRole,
      isActive: raw.isActive,
      lastLoginAt: raw.lastLoginAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toDTO(entity: UserCredentialEntity): AuthUserResponseDTO {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      isActive: entity.isActive,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
    };
  }
}
