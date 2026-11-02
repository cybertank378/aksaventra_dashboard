import type { UpdateProfileRequestDTO } from "@/modules/auth/domain/dto/ProfileDTO";

export class ProfileValidator {
  public static validateUpdate(data: unknown): {
    isValid: boolean;
    errors?: Record<string, string>;
    data?: UpdateProfileRequestDTO;
  } {
    if (!data || typeof data !== "object") {
      return {
        isValid: false,
        errors: { name: "Data formulir tidak valid" },
      };
    }

    const payload = data as Record<string, unknown>;
    const name = typeof payload.name === "string" ? payload.name.trim() : "";

    if (!name) {
      return {
        isValid: false,
        errors: { name: "Nama lengkap wajib diisi" },
      };
    }

    if (name.length < 2) {
      return {
        isValid: false,
        errors: { name: "Nama minimal 2 karakter" },
      };
    }

    if (name.length > 100) {
      return {
        isValid: false,
        errors: { name: "Nama maksimal 100 karakter" },
      };
    }

    let image: string | null | undefined;
    if (payload.image === null) {
      image = null;
    } else if (typeof payload.image === "string") {
      image = payload.image.trim();
    }

    return {
      isValid: true,
      data: { name, ...(image !== undefined ? { image } : {}) },
    };
  }
}
