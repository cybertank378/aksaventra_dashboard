import { prisma } from "@/core/libs/prisma";

export interface RevokeSessionParams {
  userId: string;
  sessionId: string;
  ipAddress?: string;
}

export class RevokeSessionUseCase {
  public async execute(params: RevokeSessionParams): Promise<boolean> {
    const session = await prisma.session.findFirst({
      where: {
        id: params.sessionId,
        userId: params.userId,
      },
    });

    if (!session) {
      return false;
    }

    await prisma.$transaction(async (tx) => {
      await tx.session.delete({
        where: { id: params.sessionId },
      });

      await tx.auditLog.create({
        data: {
          userId: params.userId,
          action: "SESSION_REVOKED",
          target: `Session:${params.sessionId}`,
          details: JSON.stringify({
            userAgent: session.userAgent,
            ipAddress: session.ipAddress,
          }),
          ipAddress: params.ipAddress ?? null,
        },
      });
    });

    return true;
  }
}
