import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/core/libs/prisma";
import { GetUserProfileUseCase } from "@/modules/auth/application/usecase/GetUserProfileUseCase";
import { RevokeSessionUseCase } from "@/modules/auth/application/usecase/RevokeSessionUseCase";
import { UpdateProfileUseCase } from "@/modules/auth/application/usecase/UpdateProfileUseCase";

vi.mock("@/core/libs/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    session: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => {
      return cb(prisma);
    }),
  },
}));

describe("Profile Use Cases (Triple A Pattern)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GetUserProfileUseCase", () => {
    it("should return null if user is not found", async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const useCase = new GetUserProfileUseCase();

      // Act
      const result = await useCase.execute({ userId: "non-existent" });

      // Assert
      expect(result).toBeNull();
    });

    it("should return user profile with active sessions and permissions for ADMIN", async () => {
      // Arrange
      const now = new Date();
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-1",
        name: "M. Fahd Indrawan",
        email: "admin@aksaventra.co.id",
        role: "ADMIN",
        isActive: true,
        createdAt: now,
        lastLoginAt: now,
      } as unknown as never);

      vi.mocked(prisma.session.findMany).mockResolvedValue([
        {
          id: "sess-1",
          userId: "usr-1",
          token: "token-current",
          expiresAt: new Date(Date.now() + 3600000),
          ipAddress: "103.14.21.88",
          userAgent: "Windows 11 • Chrome 130",
          createdAt: now,
        },
      ] as unknown as never);

      const useCase = new GetUserProfileUseCase();

      // Act
      const result = await useCase.execute({
        userId: "usr-1",
        currentToken: "token-current",
      });

      // Assert
      expect(result).not.toBeNull();
      expect(result?.name).toBe("M. Fahd Indrawan");
      expect(result?.email).toBe("admin@aksaventra.co.id");
      expect(result?.role).toBe("ADMIN");
      expect(result?.permissions).toContain("SETTINGS_MANAGE");
      expect(result?.sessions).toHaveLength(1);
      expect(result?.sessions[0].isCurrent).toBe(true);
      expect(result?.sessions[0].userAgent).toBe("Windows 11 • Chrome 130");
    });
  });

  describe("UpdateProfileUseCase", () => {
    it("should throw error if user not found", async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const useCase = new UpdateProfileUseCase();

      // Act & Assert
      await expect(
        useCase.execute({
          userId: "usr-404",
          dto: { name: "New Name" },
        }),
      ).rejects.toThrow("Pengguna tidak ditemukan");
    });

    it("should update user name and create audit log", async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "usr-1",
        name: "Old Name",
        email: "admin@aksaventra.co.id",
      } as unknown as never);

      vi.mocked(prisma.user.update).mockResolvedValue({
        id: "usr-1",
        name: "Updated Name",
        email: "admin@aksaventra.co.id",
      } as unknown as never);

      const useCase = new UpdateProfileUseCase();

      // Act
      const result = await useCase.execute({
        userId: "usr-1",
        dto: { name: "Updated Name" },
        ipAddress: "127.0.0.1",
      });

      // Assert
      expect(result.name).toBe("Updated Name");
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "usr-1" },
        data: { name: "Updated Name" },
        select: { id: true, name: true, email: true },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("RevokeSessionUseCase", () => {
    it("should return false if session is not found", async () => {
      // Arrange
      vi.mocked(prisma.session.findFirst).mockResolvedValue(null);
      const useCase = new RevokeSessionUseCase();

      // Act
      const result = await useCase.execute({
        userId: "usr-1",
        sessionId: "sess-not-found",
      });

      // Assert
      expect(result).toBe(false);
    });

    it("should delete session and create audit log when session is found", async () => {
      // Arrange
      vi.mocked(prisma.session.findFirst).mockResolvedValue({
        id: "sess-2",
        userId: "usr-1",
        token: "tok-2",
        ipAddress: "192.168.1.1",
        userAgent: "Safari",
      } as unknown as never);

      const useCase = new RevokeSessionUseCase();

      // Act
      const result = await useCase.execute({
        userId: "usr-1",
        sessionId: "sess-2",
        ipAddress: "127.0.0.1",
      });

      // Assert
      expect(result).toBe(true);
      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { id: "sess-2" },
      });
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
