import { createHmac } from "node:crypto";
import type { TokenProviderInterface } from "@/modules/auth/domain/interfaces/TokenProviderInterface";
import type { AuthJwtPayload } from "@/modules/auth/domain/types/AuthJwtPayload";

export class JwtProvider implements TokenProviderInterface {
  private readonly secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.JWT_SECRET || "aksaventra_secure_jwt_secret_key_2026";
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return Buffer.from(base64, "base64").toString();
  }

  public async signAccessToken(payload: AuthJwtPayload): Promise<string> {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + 60 * 60, // 1 hour
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = createHmac("sha256", this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  public async signRefreshToken(payload: AuthJwtPayload): Promise<string> {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 days
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));

    const signature = createHmac("sha256", this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  public async verifyToken(token: string): Promise<AuthJwtPayload | null> {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      const expectedSignature = createHmac("sha256", this.secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      if (signature !== expectedSignature) {
        return null;
      }

      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as AuthJwtPayload;
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
