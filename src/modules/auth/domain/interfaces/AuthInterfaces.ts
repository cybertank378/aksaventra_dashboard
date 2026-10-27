import type { EmailVerificationTokenEntity } from "@/modules/auth/domain/entity/EmailVerificationTokenEntity";
import type { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { PasswordResetTokenEntity } from "@/modules/auth/domain/entity/PasswordResetTokenEntity";
import type { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import type { UserSessionEntity } from "@/modules/auth/domain/entity/UserSessionEntity";

export interface AuthRepositoryInterface {
  findUserById(id: string): Promise<UserCredentialEntity | null>;
  findUserByEmail(email: string): Promise<UserCredentialEntity | null>;
  saveUser(user: UserCredentialEntity): Promise<UserCredentialEntity>;
  updateUser(user: UserCredentialEntity): Promise<UserCredentialEntity>;

  createSession(session: UserSessionEntity): Promise<UserSessionEntity>;
  findSessionByToken(token: string): Promise<UserSessionEntity | null>;
  deleteSession(token: string): Promise<boolean>;
  deleteSessionsByUserId(userId: string): Promise<number>;

  createLoginAudit(audit: LoginAuditEntity): Promise<LoginAuditEntity>;
  findRecentLoginAudits(limit?: number): Promise<LoginAuditEntity[]>;
  findFailedLoginAudits(limit?: number): Promise<LoginAuditEntity[]>;
  findSuspiciousLoginAudits(limit?: number): Promise<LoginAuditEntity[]>;
  findLoginAuditsByUserId(userId: string, limit?: number): Promise<LoginAuditEntity[]>;

  saveEmailVerificationToken(
    token: EmailVerificationTokenEntity,
  ): Promise<EmailVerificationTokenEntity>;
  findEmailVerificationToken(token: string): Promise<EmailVerificationTokenEntity | null>;

  savePasswordResetToken(token: PasswordResetTokenEntity): Promise<PasswordResetTokenEntity>;
  findPasswordResetToken(token: string): Promise<PasswordResetTokenEntity | null>;
}
