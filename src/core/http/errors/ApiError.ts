export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static badRequest(message = "Bad Request", details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  public static unauthorized(message = "Unauthorized", details?: unknown): ApiError {
    return new ApiError(401, message, details);
  }

  public static forbidden(message = "Forbidden", details?: unknown): ApiError {
    return new ApiError(403, message, details);
  }

  public static notFound(message = "Resource Not Found", details?: unknown): ApiError {
    return new ApiError(404, message, details);
  }

  public static conflict(message = "Resource Conflict", details?: unknown): ApiError {
    return new ApiError(409, message, details);
  }

  public static internal(message = "Internal Server Error", details?: unknown): ApiError {
    return new ApiError(500, message, details);
  }
}
