import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import { ChangePasswordUseCase } from "@/modules/auth/application/usecase/ChangePasswordUsecase";
import { CreateLoginAuditUseCase } from "@/modules/auth/application/usecase/CreateLoginAuditUseCase";
import { FindFailedLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindFailedLoginAuditsUseCase";
import { FindLoginAuditsByUserUseCase } from "@/modules/auth/application/usecase/FindLoginAuditsByUserUseCase";
import { FindRecentLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindRecentLoginAuditsUseCase";
import { FindSuspiciousLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindSuspiciousLoginAuditsUseCase";
import { ForgotPasswordUseCase } from "@/modules/auth/application/usecase/ForgotPasswordUseCase";
import { LoginUseCase } from "@/modules/auth/application/usecase/LoginUseCase";
import { LogoutAllUseCase } from "@/modules/auth/application/usecase/LogoutAllUsecase";
import { LogoutUseCase } from "@/modules/auth/application/usecase/LogoutUseCase";
import { RefreshTokenUseCase } from "@/modules/auth/application/usecase/RefreshTokenUseCase";
import { RegisterUseCase } from "@/modules/auth/application/usecase/RegisterUseCase";
import { ResetPasswordUseCase } from "@/modules/auth/application/usecase/ResetPasswordUseCase";
import { SendVerificationUseCase } from "@/modules/auth/application/usecase/SendVerificationUseCase";
import { ValidateAccessTokenUseCase } from "@/modules/auth/application/usecase/ValidateAccessTokenUseCase";
import { VerifyEmailUseCase } from "@/modules/auth/application/usecase/VerifyEmailUseCase";
import type {
  ChangePasswordRequestDTO,
  CreateLoginAuditRequestDTO,
  FindFailedLoginAuditRequestDTO,
  FindLoginAuditByUserRequestDTO,
  FindRecentLoginAuditRequestDTO,
  FindSuspiciousLoginAuditRequestDTO,
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  LogoutAllRequestDTO,
  LogoutRequestDTO,
  RefreshTokenRequestDTO,
  RegisterRequestDTO,
  ResetPasswordRequestDTO,
  SendVerificationRequestDTO,
  ValidateAccessTokenRequestDTO,
  VerifyEmailRequestDTO,
} from "@/modules/auth/domain/dto/AuthRequestDTO";
import type {
  ChangePasswordResponseDTO,
  CurrentAuthResponseDTO,
  ForgotPasswordResponseDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  RefreshTokenResponseDTO,
  RegisterResponseDTO,
  VerifyEmailResponseDTO,
} from "@/modules/auth/domain/dto/AuthResponseDTO";
import type { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { AuthInterfaces } from "@/modules/auth/domain/interfaces/AuthInterfaces";
import type { MailProviderInterface } from "@/modules/auth/domain/interfaces/MailProviderInterface";
import type { PasswordHasherInterface } from "@/modules/auth/domain/interfaces/PasswordHasherInterface";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";

/* ============================================================
 * AUTH SERVICE
 * ============================================================
 *
 * Responsibility:
 * - Application Facade
 * - UseCase Orchestrator
 * - Transaction Boundary
 * - Auth Workflow Coordinator
 * - Thin Application Entry Point
 *
 * NOT:
 * - Business Logic Layer
 * - repo Wrapper
 * - Database Layer
 * ============================================================
 */

export class AuthServices extends BaseService {
  //////////////////////////////////////////////////////////////
  // AUTH USE CASES
  //////////////////////////////////////////////////////////////

  private readonly registerUseCase: RegisterUseCase;
  private readonly loginUseCase: LoginUseCase;
  private readonly refreshTokenUseCase: RefreshTokenUseCase;
  private readonly logoutUseCase: LogoutUseCase;
  private readonly logoutAllUseCase: LogoutAllUseCase;
  private readonly forgotPasswordUseCase: ForgotPasswordUseCase;
  private readonly resetPasswordUseCase: ResetPasswordUseCase;
  private readonly changePasswordUseCase: ChangePasswordUseCase;
  private readonly verifyEmailUseCase: VerifyEmailUseCase;
  private readonly sendVerificationUseCase: SendVerificationUseCase;
  private readonly validateAccessTokenUseCase: ValidateAccessTokenUseCase;

  //////////////////////////////////////////////////////////////
  // AUDIT USE CASES
  //////////////////////////////////////////////////////////////

  private readonly createLoginAuditUseCase: CreateLoginAuditUseCase;
  private readonly findLoginAuditsByUserUseCase: FindLoginAuditsByUserUseCase;
  private readonly findRecentLoginAuditsUseCase: FindRecentLoginAuditsUseCase;
  private readonly findFailedLoginAuditsUseCase: FindFailedLoginAuditsUseCase;
  private readonly findSuspiciousLoginAuditsUseCase: FindSuspiciousLoginAuditsUseCase;

  //////////////////////////////////////////////////////////////
  // CONSTRUCTOR
  //////////////////////////////////////////////////////////////

  constructor(
    repo: AuthInterfaces,
    passwordHasher: PasswordHasherInterface,
    tokenProvider: TokenProviderInterface,
    mailProvider: MailProviderInterface,
  ) {
    super("AuthService");

    ////////////////////////////////////////////////////////////
    // AUTH
    ////////////////////////////////////////////////////////////

    this.registerUseCase = new RegisterUseCase(repo, passwordHasher, mailProvider);

    this.loginUseCase = new LoginUseCase(repo, passwordHasher, tokenProvider);

    this.refreshTokenUseCase = new RefreshTokenUseCase(repo, tokenProvider);

    this.logoutUseCase = new LogoutUseCase(repo);

    this.logoutAllUseCase = new LogoutAllUseCase(repo);

    this.forgotPasswordUseCase = new ForgotPasswordUseCase(repo, mailProvider);

    this.resetPasswordUseCase = new ResetPasswordUseCase(repo, passwordHasher);

    this.changePasswordUseCase = new ChangePasswordUseCase(repo, passwordHasher);

    this.verifyEmailUseCase = new VerifyEmailUseCase(repo);

    this.sendVerificationUseCase = new SendVerificationUseCase(repo, mailProvider);

    this.validateAccessTokenUseCase = new ValidateAccessTokenUseCase(repo, tokenProvider);

    ////////////////////////////////////////////////////////////
    // AUDIT
    ////////////////////////////////////////////////////////////

    this.createLoginAuditUseCase = new CreateLoginAuditUseCase(repo);

    this.findLoginAuditsByUserUseCase = new FindLoginAuditsByUserUseCase(repo);

    this.findRecentLoginAuditsUseCase = new FindRecentLoginAuditsUseCase(repo);

    this.findFailedLoginAuditsUseCase = new FindFailedLoginAuditsUseCase(repo);

    this.findSuspiciousLoginAuditsUseCase = new FindSuspiciousLoginAuditsUseCase(repo);
  }

  /* ==========================================================
   * REGISTER
   * ======================================================== */

  register(request: RegisterRequestDTO): Promise<Result<RegisterResponseDTO>> {
    return this.execute(() => this.registerUseCase.execute(request));
  }

  /* ==========================================================
   * LOGIN
   * ======================================================== */

  login(request: LoginRequestDTO): Promise<Result<LoginResponseDTO>> {
    return this.execute(() => this.loginUseCase.execute(request));
  }

  /* ==========================================================
   * REFRESH TOKEN
   * ======================================================== */

  refreshToken(request: RefreshTokenRequestDTO): Promise<Result<RefreshTokenResponseDTO>> {
    return this.execute(() => this.refreshTokenUseCase.execute(request));
  }

  /* ==========================================================
   * LOGOUT
   * ======================================================== */

  logout(request: LogoutRequestDTO): Promise<Result<LogoutResponseDTO>> {
    return this.execute(() => this.logoutUseCase.execute(request));
  }

  /* ==========================================================
   * LOGOUT ALL
   * ======================================================== */

  logoutAll(request: LogoutAllRequestDTO): Promise<Result<LogoutResponseDTO>> {
    return this.execute(() => this.logoutAllUseCase.execute(request));
  }

  /* ==========================================================
   * FORGOT PASSWORD
   * ======================================================== */

  forgotPassword(request: ForgotPasswordRequestDTO): Promise<Result<ForgotPasswordResponseDTO>> {
    return this.execute(() => this.forgotPasswordUseCase.execute(request));
  }

  /* ==========================================================
   * RESET PASSWORD
   * ======================================================== */

  resetPassword(request: ResetPasswordRequestDTO) {
    return this.execute(() => this.resetPasswordUseCase.execute(request));
  }

  /* ==========================================================
   * CHANGE PASSWORD
   * ======================================================== */

  changePassword(request: ChangePasswordRequestDTO): Promise<Result<ChangePasswordResponseDTO>> {
    return this.execute(() => this.changePasswordUseCase.execute(request));
  }

  /* ==========================================================
   * VERIFY EMAIL
   * ======================================================== */

  verifyEmail(request: VerifyEmailRequestDTO): Promise<Result<VerifyEmailResponseDTO>> {
    return this.execute(() => this.verifyEmailUseCase.execute(request));
  }

  /* ==========================================================
   * SEND VERIFICATION
   * ======================================================== */

  sendVerification(request: SendVerificationRequestDTO) {
    return this.execute(() => this.sendVerificationUseCase.execute(request));
  }

  /* ==========================================================
   * VALIDATE ACCESS TOKEN
   * ======================================================== */

  validateAccessToken(
    request: ValidateAccessTokenRequestDTO,
  ): Promise<Result<CurrentAuthResponseDTO>> {
    return this.execute(() => this.validateAccessTokenUseCase.execute(request));
  }

  /* ==========================================================
   * CREATE LOGIN AUDIT
   * ======================================================== */

  createLoginAudit(request: CreateLoginAuditRequestDTO): Promise<Result<LoginAuditEntity>> {
    return this.execute(() => this.createLoginAuditUseCase.execute(request));
  }

  /* ==========================================================
   * FIND LOGIN AUDITS BY USER
   * ======================================================== */

  findLoginAuditsByUser(
    request: FindLoginAuditByUserRequestDTO,
  ): Promise<Result<LoginAuditEntity[]>> {
    return this.execute(() => this.findLoginAuditsByUserUseCase.execute(request));
  }

  /* ==========================================================
   * FIND RECENT LOGIN AUDITS
   * ======================================================== */

  findRecentLoginAudits(
    request: FindRecentLoginAuditRequestDTO,
  ): Promise<Result<LoginAuditEntity[]>> {
    return this.execute(() => this.findRecentLoginAuditsUseCase.execute(request));
  }

  /* ==========================================================
   * FIND FAILED LOGIN AUDITS
   * ======================================================== */

  findFailedLoginAudits(
    request: FindFailedLoginAuditRequestDTO,
  ): Promise<Result<LoginAuditEntity[]>> {
    return this.execute(() => this.findFailedLoginAuditsUseCase.execute(request));
  }

  /* ==========================================================
   * FIND SUSPICIOUS LOGIN AUDITS
   * ======================================================== */
  findSuspiciousLoginAudits(
    dto: FindSuspiciousLoginAuditRequestDTO,
  ): Promise<Result<LoginAuditEntity[]>> {
    return this.execute(() => this.findSuspiciousLoginAuditsUseCase.execute(dto));
  }
}

export { AuthServices as AuthService };
