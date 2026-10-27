import { prisma } from "@/core/libs/prisma";
import type { UserRole } from "@/libs/enums";
import type { EmailVerificationTokenEntity } from "@/modules/auth/domain/entity/EmailVerificationTokenEntity";
import { LoginAuditEntity } from "@/modules/auth/domain/entity/LoginAuditEntity";
import type { PasswordResetTokenEntity } from "@/modules/auth/domain/entity/PasswordResetTokenEntity";
import { UserCredentialEntity } from "@/modules/auth/domain/entity/UserCredentialEntity";
import { UserSessionEntity } from "@/modules/auth/domain/entity/UserSessionEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthInterfaces";

export class AuthRepository implements AuthRepositoryInterface {
  private inMemoryVerificationTokens = new Map<string, EmailVerificationTokenEntity>();
  private inMemoryResetTokens = new Map<string, PasswordResetTokenEntity>();

  public async findUserById(id: string): Promise<UserCredentialEntity | null> {
    const raw = await prisma.user.findUnique({
      where: { id },
    });
    if (!raw) return null;

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

  public async findUserByEmail(email: string): Promise<UserCredentialEntity | null> {
    const raw = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!raw) return null;

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

  public async saveUser(user: UserCredentialEntity): Promise<UserCredentialEntity> {
    const raw = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
      },
    });

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

  public async updateUser(user: UserCredentialEntity): Promise<UserCredentialEntity> {
    const raw = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: user.passwordHash,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
    });

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

  public async createSession(session: UserSessionEntity): Promise<UserSessionEntity> {
    const raw = await prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        token: session.token,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    });

    return UserSessionEntity.create({
      id: raw.id,
      userId: raw.userId,
      token: raw.token,
      expiresAt: raw.expiresAt,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      createdAt: raw.createdAt,
    });
  }

  public async findSessionByToken(token: string): Promise<UserSessionEntity | null> {
    const raw = await prisma.session.findUnique({
      where: { token },
    });
    if (!raw) return null;

    return UserSessionEntity.create({
      id: raw.id,
      userId: raw.userId,
      token: raw.token,
      expiresAt: raw.expiresAt,
      ipAddress: raw.ipAddress,
      userAgent: raw.userAgent,
      createdAt: raw.createdAt,
    });
  }

  public async deleteSession(token: string): Promise<boolean> {
    try {
      await prisma.session.delete({
        where: { token },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async deleteSessionsByUserId(userId: string): Promise<number> {
    const res = await prisma.session.deleteMany({
      where: { userId },
    });
    return res.count;
  }

  public async createLoginAudit(audit: LoginAuditEntity): Promise<LoginAuditEntity> {
    const raw = await prisma.auditLog.create({
      data: {
        id: audit.id,
        userId: audit.userId,
        action: audit.action,
        target: audit.target,
        details: audit.details,
        ipAddress: audit.ipAddress,
      },
    });

    return LoginAuditEntity.create({
      id: raw.id,
      userId: raw.userId,
      action: raw.action,
      target: raw.target,
      details: raw.details,
      ipAddress: raw.ipAddress,
      createdAt: raw.createdAt,
    });
  }

  public async findRecentLoginAudits(limit = 20): Promise<LoginAuditEntity[]> {
    const records = await prisma.auditLog.findMany({
      where: {
        action: { startsWith: "LOGIN" },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((raw) =>
      LoginAuditEntity.create({
        id: raw.id,
        userId: raw.userId,
        action: raw.action,
        target: raw.target,
        details: raw.details,
        ipAddress: raw.ipAddress,
        createdAt: raw.createdAt,
      }),
    );
  }

  public async findFailedLoginAudits(limit = 20): Promise<LoginAuditEntity[]> {
    const records = await prisma.auditLog.findMany({
      where: {
        action: "LOGIN_FAILED",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((raw) =>
      LoginAuditEntity.create({
        id: raw.id,
        userId: raw.userId,
        action: raw.action,
        target: raw.target,
        details: raw.details,
        ipAddress: raw.ipAddress,
        createdAt: raw.createdAt,
      }),
    );
  }

  public async findSuspiciousLoginAudits(limit = 20): Promise<LoginAuditEntity[]> {
    const records = await prisma.auditLog.findMany({
      where: {
        action: { in: ["LOGIN_FAILED", "SUSPICIOUS_LOGIN", "ACCOUNT_LOCKED"] },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((raw) =>
      LoginAuditEntity.create({
        id: raw.id,
        userId: raw.userId,
        action: raw.action,
        target: raw.target,
        details: raw.details,
        ipAddress: raw.ipAddress,
        createdAt: raw.createdAt,
      }),
    );
  }

  public async findLoginAuditsByUserId(userId: string, limit = 20): Promise<LoginAuditEntity[]> {
    const records = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return records.map((raw) =>
      LoginAuditEntity.create({
        id: raw.id,
        userId: raw.userId,
        action: raw.action,
        target: raw.target,
        details: raw.details,
        ipAddress: raw.ipAddress,
        createdAt: raw.createdAt,
      }),
    );
  }

  public async saveEmailVerificationToken(
    token: EmailVerificationTokenEntity,
  ): Promise<EmailVerificationTokenEntity> {
    this.inMemoryVerificationTokens.set(token.token, token);
    return token;
  }

  public async findEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationTokenEntity | null> {
    return this.inMemoryVerificationTokens.get(token) || null;
  }

  public async savePasswordResetToken(
    token: PasswordResetTokenEntity,
  ): Promise<PasswordResetTokenEntity> {
    this.inMemoryResetTokens.set(token.token, token);
    return token;
  }

  public async findPasswordResetToken(token: string): Promise<PasswordResetTokenEntity | null> {
    return this.inMemoryResetTokens.get(token) || null;
  }
}
