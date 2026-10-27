import type {
  ChangePasswordRequestDTO,
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  ResetPasswordRequestDTO,
} from "@/modules/auth/domain/dto/AuthRequestDTO";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class AuthValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public static validateLogin(dto: Partial<LoginRequestDTO>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!dto.email || !AuthValidator.EMAIL_REGEX.test(dto.email.trim())) {
      errors.email = "Format email tidak valid";
    }

    if (!dto.password || dto.password.trim().length === 0) {
      errors.password = "Password wajib diisi";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  public static validateRegister(dto: Partial<RegisterRequestDTO>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!dto.email || !AuthValidator.EMAIL_REGEX.test(dto.email.trim())) {
      errors.email = "Format email tidak valid";
    }

    if (!dto.password || dto.password.length < 8) {
      errors.password = "Password minimal 8 karakter";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  public static validateForgotPassword(dto: Partial<ForgotPasswordRequestDTO>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!dto.email || !AuthValidator.EMAIL_REGEX.test(dto.email.trim())) {
      errors.email = "Format email tidak valid";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  public static validateResetPassword(dto: Partial<ResetPasswordRequestDTO>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!dto.token || dto.token.trim().length === 0) {
      errors.token = "Token reset password wajib disertakan";
    }

    if (!dto.newPassword || dto.newPassword.length < 8) {
      errors.newPassword = "Password baru minimal 8 karakter";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  public static validateChangePassword(dto: Partial<ChangePasswordRequestDTO>): ValidationResult {
    const errors: Record<string, string> = {};

    if (!dto.userId) {
      errors.userId = "User ID wajib disertakan";
    }

    if (!dto.oldPassword) {
      errors.oldPassword = "Password lama wajib diisi";
    }

    if (!dto.newPassword || dto.newPassword.length < 8) {
      errors.newPassword = "Password baru minimal 8 karakter";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
