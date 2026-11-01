import { prisma } from "@/core/libs/prisma";
import type { UpdateProfileRequestDTO } from "@/modules/auth/domain/dto/ProfileDTO";

export interface UpdateProfileParams {
  userId: string;
  dto: UpdateProfileRequestDTO;
  ipAddress?: string;
}

export class UpdateProfileUseCase {
  public async execute(
    params: UpdateProfileParams,
  ): Promise<{ id: string; name: string | null; email: string }> {
    const existing = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true },
    });

    if (!existing) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: params.userId },
        data: { name: params.dto.name.trim() },
        select: { id: true, name: true, email: true },
      });

      await tx.auditLog.create({
        data: {
          userId: params.userId,
          action: "PROFILE_UPDATED",
          target: user.email,
          details: JSON.stringify({
            previousName: existing.name,
            newName: user.name,
          }),
          ipAddress: params.ipAddress ?? null,
        },
      });

      return user;
    });

    return updated;
  }
}
