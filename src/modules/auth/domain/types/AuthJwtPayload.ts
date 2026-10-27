import type { UserRole } from "@/libs/enums";

export interface AuthJwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti?: string;
  iat?: number;
  exp?: number;
}
