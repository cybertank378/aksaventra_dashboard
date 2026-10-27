import { randomUUID } from "node:crypto";
import type { BaseUseCase } from "@/core/application/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AuthUserResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import { AuthMapper } from "@/modules/auth/domain/mapper/AuthMapper";
import { PasswordPolicyRule } from "@/modules/auth/domain/rules/PasswordPolicyRule";
import { RegisterPolicyRule } from "@/modules/auth/domain/rules/RegisterPolicyRule";

export interface RegisterUseCaseInput {
  email: string;
  password: string;
  name?: string;
}

export class RegisterUseCase
  implements BaseUseCase<RegisterUseCaseInput, Result<AuthUserResponseDTO, string>>
{
  constructor(
    private readonly authRepo: AuthRepositoryInterface,
    private readonly hasher: PasswordHasherInterface,
  ) {}

  public async execute(input: RegisterUseCaseInput): Promise<Result<AuthUserResponseDTO, string>> {
    const emailValidation = RegisterPolicyRule.validate(input.email);
    if (!emailValidation.isValid) {
      return Result.fail(emailValidation.message || "Invalid email address");
    }

    const passwordValidation = PasswordPolicyRule.validate(input.password);
    if (!passwordValidation.isValid) {
      return Result.fail(passwordValidation.message || "Invalid password format");
    }

    const existingUser = await this.authRepo.findUserByEmail(input.email);
    if (existingUser) {
      return Result.fail("Email already registered");
    }

    const passwordHash = await this.hasher.hash(input.password);
    const newUser = UserCredentialEntity.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      name: input.name,
      role: "ADMIN",
      isActive: true,
    });

    const saved = await this.authRepo.saveUser(newUser);
    return Result.ok(AuthMapper.toDTO(saved));
  }
}
