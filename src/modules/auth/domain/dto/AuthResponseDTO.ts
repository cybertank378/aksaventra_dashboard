import type { UserRole } from "@/libs/enums";
import type { AuthTokens } from "@/modules/auth/domain/types/AuthTokens";

export interface AuthUserResponseDTO {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export type RegisterResponseDTO = AuthUserResponseDTO;

export interface LoginResponseDTO {
  user: AuthUserResponseDTO;
  tokens: AuthTokens;
}

export interface TokenResponseDTO {
  tokens: AuthTokens;
}

export type RefreshTokenResponseDTO = TokenResponseDTO;

export interface LogoutResponseDTO {
  success: boolean;
  message?: string;
}

export interface ForgotPasswordResponseDTO {
  success: boolean;
  message?: string;
}

export interface ChangePasswordResponseDTO {
  success: boolean;
  message?: string;
}

export interface VerifyEmailResponseDTO {
  success: boolean;
  message?: string;
}

export interface CurrentAuthResponseDTO {
  id: string;
  email: string;
  role: UserRole;
  name?: string | null;
  isActive: boolean;
}

export interface MessageResponseDTO {
  message: string;
  success: boolean;
}
