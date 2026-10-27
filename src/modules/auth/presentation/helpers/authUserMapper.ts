import type { AuthUserResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";

export interface UserPresentationModel {
  id: string;
  displayName: string;
  email: string;
  roleBadgeText: string;
  statusText: string;
  lastLoginFormatted: string;
}

export class AuthUserMapper {
  public static toPresentation(user: AuthUserResponseDTO): UserPresentationModel {
    return {
      id: user.id,
      displayName: user.name || user.email.split("@")[0] || "User",
      email: user.email,
      roleBadgeText: user.role,
      statusText: user.isActive ? "Active" : "Inactive",
      lastLoginFormatted: user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Belum pernah login",
    };
  }
}
