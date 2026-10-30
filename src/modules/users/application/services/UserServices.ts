import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import { CreateUserUseCase } from "@/modules/users/application/usecase/CreateUserUseCase";
import { GetUserDetailUseCase } from "@/modules/users/application/usecase/GetUserDetailUseCase";
import { GetUserStatsUseCase } from "@/modules/users/application/usecase/GetUserStatsUseCase";
import { ListUsersUseCase } from "@/modules/users/application/usecase/ListUsersUseCase";
import { RevokeUserSessionsUseCase } from "@/modules/users/application/usecase/RevokeUserSessionsUseCase";
import { UpdateUserStatusUseCase } from "@/modules/users/application/usecase/UpdateUserStatusUseCase";
import { UpdateUserUseCase } from "@/modules/users/application/usecase/UpdateUserUseCase";
import type {
  CreateUserDTO,
  ListUsersQueryDTO,
  UpdateUserDTO,
  UpdateUserStatusDTO,
} from "@/modules/users/domain/dto/UserRequestDTO";
import type {
  UserAdminItemDTO,
  UserDetailResponseDTO,
  UserListResponseDTO,
  UserMutationResponseDTO,
  UserStatsResponseDTO,
} from "@/modules/users/domain/dto/UserResponseDTO";
import type { UserRepositoryInterface } from "@/modules/users/domain/interfaces/UserInterfaces";

/* ============================================================
 * USER SERVICES FACADE
 * ============================================================
 *
 * Responsibility:
 * - Application Facade for User Management
 * - Use Case Orchestration
 * - Security & Audit Context Dispatcher
 * ============================================================
 */

export class UserServices extends BaseService {
  private readonly listUsersUseCase: ListUsersUseCase;
  private readonly getUserStatsUseCase: GetUserStatsUseCase;
  private readonly getUserDetailUseCase: GetUserDetailUseCase;
  private readonly createUserUseCase: CreateUserUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly updateUserStatusUseCase: UpdateUserStatusUseCase;
  private readonly revokeUserSessionsUseCase: RevokeUserSessionsUseCase;

  constructor(repo: UserRepositoryInterface, passwordHasher: PasswordHasherInterface) {
    super("UserService");

    this.listUsersUseCase = new ListUsersUseCase(repo);
    this.getUserStatsUseCase = new GetUserStatsUseCase(repo);
    this.getUserDetailUseCase = new GetUserDetailUseCase(repo);
    this.createUserUseCase = new CreateUserUseCase(repo, passwordHasher);
    this.updateUserUseCase = new UpdateUserUseCase(repo);
    this.updateUserStatusUseCase = new UpdateUserStatusUseCase(repo);
    this.revokeUserSessionsUseCase = new RevokeUserSessionsUseCase(repo);
  }

  public listUsers(query: ListUsersQueryDTO): Promise<Result<UserListResponseDTO, Error>> {
    return this.listUsersUseCase.execute(query);
  }

  public getStats(): Promise<Result<UserStatsResponseDTO, Error>> {
    return this.getUserStatsUseCase.execute();
  }

  public getUserDetail(id: string): Promise<Result<UserDetailResponseDTO, Error>> {
    return this.getUserDetailUseCase.execute(id);
  }

  public createUser(
    dto: CreateUserDTO,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserAdminItemDTO, Error>> {
    return this.createUserUseCase.execute(dto, actorUserId, ipAddress);
  }

  public updateUser(
    id: string,
    dto: UpdateUserDTO,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserAdminItemDTO, Error>> {
    return this.updateUserUseCase.execute(id, dto, actorUserId, ipAddress);
  }

  public updateUserStatus(
    id: string,
    dto: UpdateUserStatusDTO,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserAdminItemDTO, Error>> {
    return this.updateUserStatusUseCase.execute(id, dto, actorUserId, ipAddress);
  }

  public revokeUserSessions(
    userId: string,
    actorUserId?: string,
    ipAddress?: string,
  ): Promise<Result<UserMutationResponseDTO, Error>> {
    return this.revokeUserSessionsUseCase.execute(userId, actorUserId, ipAddress);
  }
}
