import type { AuthJwtPayload } from "@/modules/auth/domain/types/AuthJwtPayload";

export interface TokenProviderInterface {
  signAccessToken(payload: AuthJwtPayload): Promise<string>;
  signRefreshToken(payload: AuthJwtPayload): Promise<string>;
  verifyToken(token: string): Promise<AuthJwtPayload | null>;
}
