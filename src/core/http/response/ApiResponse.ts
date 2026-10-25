export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | Record<string, unknown> | unknown[];
  meta?: Record<string, unknown>;
  timestamp: string;
}

export class ApiResponseBuilder {
  public static success<T>(
    data: T,
    message = "Operation completed successfully",
    meta?: Record<string, unknown>,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  public static error(
    message: string,
    errorDetails?: string | Record<string, unknown> | unknown[],
    meta?: Record<string, unknown>,
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      error: errorDetails,
      meta,
      timestamp: new Date().toISOString(),
    };
  }
}
