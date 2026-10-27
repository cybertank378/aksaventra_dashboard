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

export interface LoginResponseDTO {
  user: AuthUserResponseDTO;
  tokens: AuthTokens;
}

export interface TokenResponseDTO {
  tokens: AuthTokens;
}

export interface MessageResponseDTO {
  message: string;
  success: boolean;
}
