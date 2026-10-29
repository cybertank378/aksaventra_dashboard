import type { UserRole } from "@/libs/enums";

export interface CurrentAuth {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
}
