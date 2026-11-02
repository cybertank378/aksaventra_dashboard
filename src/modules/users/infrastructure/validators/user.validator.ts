import type { UserRole } from "@/libs/enums";
import type {
  CreateUserDTO,
  ListUsersQueryDTO,
  UpdateUserDTO,
  UpdateUserStatusDTO,
} from "@/modules/users/domain/dto/UserRequestDTO";
import type { UserAccountState } from "@/modules/users/domain/dto/UserResponseDTO";

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set<UserRole>(["ADMIN", "OPERATOR", "AUDITOR", "CLIENT"]);
const VALID_ACCOUNT_STATES = new Set<UserAccountState>(["ACTIVE", "LOCKED", "INACTIVE"]);

export class UserValidator {
  public static validateListQuery(
    params: URLSearchParams | Record<string, string | string[] | undefined>,
  ): ValidationResult<ListUsersQueryDTO> {
    const get = (key: string): string | undefined => {
      if (params instanceof URLSearchParams) {
        return params.get(key) || undefined;
      }
      const val = params[key];
      return Array.isArray(val) ? val[0] : val;
    };

    const pageRaw = get("page");
    const limitRaw = get("limit");
    const searchRaw = get("search");
    const roleRaw = get("role")?.toUpperCase();
    const accountStateRaw = get("accountState")?.toUpperCase();
    const sortByRaw = get("sortBy");
    const sortOrderRaw = get("sortOrder")?.toLowerCase();

    const page = pageRaw ? Math.max(1, Number.parseInt(pageRaw, 10) || 1) : 1;
    const limit = limitRaw ? Math.max(1, Math.min(100, Number.parseInt(limitRaw, 10) || 10)) : 10;

    let role: "ALL" | UserRole = "ALL";
    if (roleRaw && VALID_ROLES.has(roleRaw as UserRole)) {
      role = roleRaw as UserRole;
    }

    let accountState: "ALL" | UserAccountState = "ALL";
    if (accountStateRaw && VALID_ACCOUNT_STATES.has(accountStateRaw as UserAccountState)) {
      accountState = accountStateRaw as UserAccountState;
    }

    const validSortBy = new Set(["name", "email", "role", "createdAt", "lastLoginAt"]);
    const sortBy = validSortBy.has(sortByRaw || "")
      ? (sortByRaw as "name" | "email" | "role" | "createdAt" | "lastLoginAt")
      : "createdAt";

    const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

    return {
      isValid: true,
      errors: {},
      data: {
        page,
        limit,
        search: searchRaw?.trim() || undefined,
        role,
        accountState,
        sortBy,
        sortOrder,
      },
    };
  }

  public static validateCreateUser(input: unknown): ValidationResult<CreateUserDTO> {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return { isValid: false, errors: { payload: "Payload pengguna tidak valid" } };
    }

    const body = input as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const roleRaw = typeof body.role === "string" ? body.role.toUpperCase() : "OPERATOR";

    if (!name || name.length < 2) {
      errors.name = "Nama minimal 2 karakter";
    } else if (name.length > 100) {
      errors.name = "Nama maksimal 100 karakter";
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      errors.email = "Format email tidak valid";
    } else if (email.length > 150) {
      errors.email = "Email terlalu panjang";
    }

    if (!password || password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    } else if (password.length > 128) {
      errors.password = "Password maksimal 128 karakter";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password harus mengandung minimal satu huruf kapital";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password harus mengandung minimal satu angka";
    }

    let role: UserRole = "OPERATOR";
    if (VALID_ROLES.has(roleRaw as UserRole)) {
      role = roleRaw as UserRole;
    } else {
      errors.role = "Role tidak valid (pilihan: ADMIN, OPERATOR, AUDITOR, CLIENT)";
    }

    const isValid = Object.keys(errors).length === 0;
    return {
      isValid,
      errors,
      data: isValid
        ? {
            name,
            email,
            password,
            role,
          }
        : undefined,
    };
  }

  public static validateUpdateUser(input: unknown): ValidationResult<UpdateUserDTO> {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return { isValid: false, errors: { payload: "Payload pembaruan tidak valid" } };
    }

    const body = input as Record<string, unknown>;
    const dto: UpdateUserDTO = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length < 2) {
        errors.name = "Nama minimal 2 karakter";
      } else if (body.name.trim().length > 100) {
        errors.name = "Nama maksimal 100 karakter";
      } else {
        dto.name = body.name.trim();
      }
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
        errors.email = "Format email tidak valid";
      } else if (body.email.trim().length > 150) {
        errors.email = "Email terlalu panjang";
      } else {
        dto.email = body.email.trim().toLowerCase();
      }
    }

    if (body.role !== undefined) {
      const roleStr = typeof body.role === "string" ? body.role.toUpperCase() : "";
      if (VALID_ROLES.has(roleStr as UserRole)) {
        dto.role = roleStr as UserRole;
      } else {
        errors.role = "Role tidak valid (pilihan: ADMIN, OPERATOR, AUDITOR, CLIENT)";
      }
    }

    if (dto.name === undefined && dto.email === undefined && dto.role === undefined) {
      errors.general = "Minimal satu field harus diisi untuk memperbarui data";
    }

    const isValid = Object.keys(errors).length === 0;
    return {
      isValid,
      errors,
      data: isValid ? dto : undefined,
    };
  }

  public static validateUpdateUserStatus(input: unknown): ValidationResult<UpdateUserStatusDTO> {
    const errors: Record<string, string> = {};

    if (!input || typeof input !== "object") {
      return { isValid: false, errors: { payload: "Payload status tidak valid" } };
    }

    const body = input as Record<string, unknown>;
    const dto: UpdateUserStatusDTO = {};

    if (body.isActive !== undefined) {
      if (typeof body.isActive === "boolean") {
        dto.isActive = body.isActive;
      } else {
        errors.isActive = "Nilai isActive harus boolean";
      }
    }

    if (body.unlock !== undefined) {
      if (typeof body.unlock === "boolean") {
        dto.unlock = body.unlock;
      } else {
        errors.unlock = "Nilai unlock harus boolean";
      }
    }

    if (body.reason !== undefined && typeof body.reason === "string") {
      dto.reason = body.reason.trim();
    }

    if (dto.isActive === undefined && dto.unlock === undefined) {
      errors.general = "Tentukan status aktif atau tindakan unlock akun";
    }

    const isValid = Object.keys(errors).length === 0;
    return {
      isValid,
      errors,
      data: isValid ? dto : undefined,
    };
  }
}
