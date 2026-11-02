import { prisma } from "@/core/libs/prisma";
import type { SessionItemDTO, UserProfileResponseDTO } from "@/modules/auth/domain/dto/ProfileDTO";
import { roleConfig } from "@/security/rbacConfig";

export interface GetUserProfileUseCaseParams {
  userId: string;
  currentToken?: string;
}

export class GetUserProfileUseCase {
  public async execute(
    params: GetUserProfileUseCaseParams,
  ): Promise<UserProfileResponseDTO | null> {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return null;
    }

    const activeSessions = await prisma.session.findMany({
      where: {
        userId: params.userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    const sessions: SessionItemDTO[] = activeSessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      isCurrent: Boolean(params.currentToken && s.token === params.currentToken),
    }));

    const permissions = roleConfig[user.role]?.permissions ?? [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      permissions,
      sessions,
    };
  }
}
