import type { ApiResponse } from "./ApiResponse";

export abstract class BaseApiResponseDTO {
  public static wrap<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message ?? "Success",
      timestamp: new Date().toISOString(),
    };
  }
}
