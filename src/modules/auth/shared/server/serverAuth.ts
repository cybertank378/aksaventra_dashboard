import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { cache } from "react";
import { prisma } from "@/core/libs/prisma";
import type { UserRole } from "@/libs/enums";

export interface ServerUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
}

/**
 * Cached session user lookup leveraging Next.js 16 "use cache".
 * This satisfies Cache Components & Partial Prefetching requirements,
 * enabling Instant Navigation without blocking uncached database warnings.
 */
async function getCachedSessionUser(token: string): Promise<ServerUser | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`session-${token}`);

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as UserRole,
    isActive: session.user.isActive,
  };
}

export const getCurrentUser = cache(async function getCurrentUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("access_token")?.value ||
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("session_token")?.value;

    if (!token) {
      return null;
    }

    return await getCachedSessionUser(token);
  } catch (error: unknown) {
    const digest = (error as { digest?: string })?.digest;
    if (digest === "HANGING_PROMISE_REJECTION" || digest?.startsWith("NEXT_")) {
      throw error;
    }
    console.error("[getCurrentUser] Error fetching user session:", error);
    return null;
  }
});
