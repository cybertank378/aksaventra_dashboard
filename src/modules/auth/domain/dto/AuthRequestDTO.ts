import type { UserRole } from "@/libs/enums";

export interface LoginRequestDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface LogoutRequestDTO {
  token: string;
}

export interface LogoutAllRequestDTO {
  userId: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequestDTO {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequestDTO {
  token: string;
}

export interface SendVerificationRequestDTO {
  userId: string;
}

export interface ValidateAccessTokenRequestDTO {
  token: string;
}

export interface CreateLoginAuditRequestDTO {
  userId?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface FindRecentLoginAuditRequestDTO {
  limit?: number;
}

export interface FindFailedLoginAuditRequestDTO {
  limit?: number;
}

export interface FindSuspiciousLoginAuditRequestDTO {
  limit?: number;
}

export interface FindLoginAuditByUserRequestDTO {
  userId: string;
  limit?: number;
}
