import { ChangePasswordUsecase } from "@/modules/auth/application/usecase/ChangePasswordUsecase";
import { CreateLoginAuditUseCase } from "@/modules/auth/application/usecase/CreateLoginAuditUseCase";
import { FindFailedLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindFailedLoginAuditsUseCase";
import { FindLoginAuditsByUserUseCase } from "@/modules/auth/application/usecase/FindLoginAuditsByUserUseCase";
import { FindRecentLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindRecentLoginAuditsUseCase";
import { FindSuspiciousLoginAuditsUseCase } from "@/modules/auth/application/usecase/FindSuspiciousLoginAuditsUseCase";
import { ForgotPasswordUseCase } from "@/modules/auth/application/usecase/ForgotPasswordUseCase";
import {
  LoginUseCase,
  type LoginUseCaseInput,
} from "@/modules/auth/application/usecase/LoginUseCase";
import { LogoutAllUsecase } from "@/modules/auth/application/usecase/LogoutAllUsecase";
import { LogoutUseCase } from "@/modules/auth/application/usecase/LogoutUseCase";
import { RefreshTokenUseCase } from "@/modules/auth/application/usecase/RefreshTokenUseCase";
import {
  RegisterUseCase,
  type RegisterUseCaseInput,
} from "@/modules/auth/application/usecase/RegisterUseCase";
import { ResetPasswordUseCase } from "@/modules/auth/application/usecase/ResetPasswordUseCase";
import { SendVerificationUseCase } from "@/modules/auth/application/usecase/SendVerificationUseCase";
import { ValidateAccessTokenUseCase } from "@/modules/auth/application/usecase/ValidateAccessTokenUseCase";
import { VerifyEmailUseCase } from "@/modules/auth/application/usecase/VerifyEmailUseCase";
import { ArgonProvider } from "@/modules/auth/infrastructure/providers/ArgonProvider";
import { JwtProvider } from "@/modules/auth/infrastructure/providers/JwtProvider";
import { MailProvider } from "@/modules/auth/infrastructure/providers/MailProvider";
import { AuthRepository } from "@/modules/auth/infrastructure/repo/AuthRepository";

export class AuthServices {
  public readonly loginUseCase: LoginUseCase;
  public readonly logoutUseCase: LogoutUseCase;
  public readonly logoutAllUseCase: LogoutAllUsecase;
  public readonly registerUseCase: RegisterUseCase;
  public readonly refreshTokenUseCase: RefreshTokenUseCase;
  public readonly validateAccessTokenUseCase: ValidateAccessTokenUseCase;
  public readonly verifyEmailUseCase: VerifyEmailUseCase;
  public readonly sendVerificationUseCase: SendVerificationUseCase;
  public readonly forgotPasswordUseCase: ForgotPasswordUseCase;
  public readonly resetPasswordUseCase: ResetPasswordUseCase;
  public readonly changePasswordUseCase: ChangePasswordUsecase;
  public readonly createLoginAuditUseCase: CreateLoginAuditUseCase;
  public readonly findRecentLoginAuditsUseCase: FindRecentLoginAuditsUseCase;
  public readonly findFailedLoginAuditsUseCase: FindFailedLoginAuditsUseCase;
  public readonly findSuspiciousLoginAuditsUseCase: FindSuspiciousLoginAuditsUseCase;
  public readonly findLoginAuditsByUserUseCase: FindLoginAuditsByUserUseCase;

  constructor(
    authRepo = new AuthRepository(),
    hasher = new ArgonProvider(),
    tokenProvider = new JwtProvider(),
    mailProvider = new MailProvider(),
  ) {
    this.loginUseCase = new LoginUseCase(authRepo, hasher, tokenProvider);
    this.logoutUseCase = new LogoutUseCase(authRepo);
    this.logoutAllUseCase = new LogoutAllUsecase(authRepo);
    this.registerUseCase = new RegisterUseCase(authRepo, hasher);
    this.refreshTokenUseCase = new RefreshTokenUseCase(authRepo, tokenProvider);
    this.validateAccessTokenUseCase = new ValidateAccessTokenUseCase(tokenProvider);
    this.verifyEmailUseCase = new VerifyEmailUseCase(authRepo);
    this.sendVerificationUseCase = new SendVerificationUseCase(authRepo, mailProvider);
    this.forgotPasswordUseCase = new ForgotPasswordUseCase(authRepo, mailProvider);
    this.resetPasswordUseCase = new ResetPasswordUseCase(authRepo, hasher);
    this.changePasswordUseCase = new ChangePasswordUsecase(authRepo, hasher);
    this.createLoginAuditUseCase = new CreateLoginAuditUseCase(authRepo);
    this.findRecentLoginAuditsUseCase = new FindRecentLoginAuditsUseCase(authRepo);
    this.findFailedLoginAuditsUseCase = new FindFailedLoginAuditsUseCase(authRepo);
    this.findSuspiciousLoginAuditsUseCase = new FindSuspiciousLoginAuditsUseCase(authRepo);
    this.findLoginAuditsByUserUseCase = new FindLoginAuditsByUserUseCase(authRepo);
  }

  public async login(input: LoginUseCaseInput) {
    return this.loginUseCase.execute(input);
  }

  public async register(input: RegisterUseCaseInput) {
    return this.registerUseCase.execute(input);
  }

  public async logout(token: string) {
    return this.logoutUseCase.execute({ token });
  }
}
