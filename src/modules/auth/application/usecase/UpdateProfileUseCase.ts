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
  ): Promise<{ id: string; name: string | null; email: string; image: string | null }> {
    const existing = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, name: true, email: true, image: true },
    });

    if (!existing) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updateData: { name: string; image?: string | null } = {
        name: params.dto.name.trim(),
      };

      if (params.dto.image !== undefined) {
        updateData.image = params.dto.image;
      }

      const user = await tx.user.update({
        where: { id: params.userId },
        data: updateData,
        select: { id: true, name: true, email: true, image: true },
      });

      await tx.auditLog.create({
        data: {
          userId: params.userId,
          action: "PROFILE_UPDATED",
          target: user.email,
          details: JSON.stringify({
            previousName: existing.name,
            newName: user.name,
            avatarUpdated: params.dto.image !== undefined,
          }),
          ipAddress: params.ipAddress ?? null,
        },
      });

      return user;
    });

    return updated;
  }
}
