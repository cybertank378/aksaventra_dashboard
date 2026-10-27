import type { UserRole } from "@/libs/enums";

export interface LoginRequestDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
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

export interface CreateLoginAuditRequestDTO {
  userId?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  ipAddress?: string | null;
}
