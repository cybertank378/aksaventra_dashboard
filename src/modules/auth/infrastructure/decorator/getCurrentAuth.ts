import type { NextRequest } from "next/server";
import type { CurrentAuth } from "@/modules/auth/domain/types/CurrentAuth";
import { JwtProvider } from "@/modules/auth/infrastructure/providers/JwtProvider";

export async function getCurrentAuth(req: NextRequest): Promise<CurrentAuth | null> {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    token = req.cookies.get("auth_token")?.value || req.cookies.get("session_token")?.value;
  }

  if (!token) return null;

  const jwtProvider = new JwtProvider();
  const payload = await jwtProvider.verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    permissions: [],
  };
}
