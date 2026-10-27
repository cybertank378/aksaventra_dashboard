import type { UserRole } from "@/libs/enums";

export function redirectByRole(role?: UserRole | string): string {
  if (role === "ADMIN") {
    return "/dashboard";
  }

  return "/dashboard";
}
