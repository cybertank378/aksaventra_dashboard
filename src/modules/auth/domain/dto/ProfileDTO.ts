import type { UserRole } from "@/libs/enums";

export interface UpdateProfileRequestDTO {
  name: string;
  image?: string | null;
}

export interface SessionItemDTO {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface UserProfileResponseDTO {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  permissions: string[];
  sessions: SessionItemDTO[];
}
