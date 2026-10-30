import type { UserRole } from "@/libs/enums";
import type { UserAccountState } from "./UserResponseDTO";

export interface ListUsersQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ALL" | UserRole;
  accountState?: "ALL" | UserAccountState;
  sortBy?: "name" | "email" | "role" | "createdAt" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface UpdateUserStatusDTO {
  isActive?: boolean;
  unlock?: boolean;
  reason?: string;
}
