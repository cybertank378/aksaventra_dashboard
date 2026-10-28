import { jwtVerify, SignJWT } from "jose";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";
import type { AuthJwtPayload } from "@/modules/auth/domain/types/AuthJwtPayload";

export class JwtProvider implements TokenProviderInterface {
  private readonly secretKey: Uint8Array;

  constructor(secret?: string) {
    const rawSecret = secret || process.env.JWT_SECRET || "aksaventra_secure_jwt_secret_key_2026";
    this.secretKey = new TextEncoder().encode(rawSecret);
  }

  public async signAccessToken(payload: AuthJwtPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(this.secretKey);
  }

  public async signRefreshToken(payload: AuthJwtPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(this.secretKey);
  }

  public async verifyToken(token: string): Promise<AuthJwtPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey, {
        algorithms: ["HS256"],
      });
      return payload as unknown as AuthJwtPayload;
    } catch {
      return null;
    }
  }
}
