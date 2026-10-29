import { cookies } from "next/headers";
import { prisma } from "@/core/libs/prisma";
import type { UserRole } from "@/libs/enums";

export interface ServerUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive: boolean;
}

export async function getCurrentUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("access_token")?.value ||
      cookieStore.get("auth_token")?.value ||
      cookieStore.get("session_token")?.value;

    if (!token) {
      return null;
    }

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
  } catch (error: unknown) {
    const digest = (error as { digest?: string })?.digest;
    if (digest === "HANGING_PROMISE_REJECTION" || digest?.startsWith("NEXT_")) {
      throw error;
    }
    console.error("[getCurrentUser] Error fetching user session:", error);
    return null;
  }
}
