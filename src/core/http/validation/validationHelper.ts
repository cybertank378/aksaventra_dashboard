import { ApiError } from "../errors/ApiError";

export class ValidationHelper {
  public static requireFields<T extends Record<string, unknown>>(
    data: T,
    requiredFields: (keyof T)[],
  ): void {
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        missing.push(String(field));
      }
    }

    if (missing.length > 0) {
      throw ApiError.badRequest(`Missing required fields: ${missing.join(", ")}`, missing);
    }
  }

  public static isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  public static isSha256(value: string): boolean {
    return /^[a-fA-F0-9]{64}$/.test(value);
  }
}
