import { NextResponse } from "next/server";
import { AppError } from "@/core/application/errors/AppError";
import { ValidationError } from "@/core/application/errors/ValidationError";
import { DomainError } from "@/core/domain/errors/DomainError";
import type { Result } from "@/core/domain/Result";
import { ApiError } from "@/core/http/errors/ApiError";
import { ApiResponseBuilder } from "@/core/http/response/ApiResponse";

export class HttpResultHandler {
  public static handle<T>(
    result: Result<T, unknown>,
    successStatus = 200,
    successMessage?: string,
  ): NextResponse {
    if (result.isSuccess) {
      const data = result.getValue();
      const body = ApiResponseBuilder.success(data, successMessage);
      return NextResponse.json(body, { status: successStatus });
    }

    const error = result.getError();
    return HttpResultHandler.handleError(error);
  }

  public static handleError(error: unknown): NextResponse {
    if (error instanceof ApiError) {
      const body = ApiResponseBuilder.error(
        error.message,
        error.details as Record<string, unknown> | undefined,
      );
      return NextResponse.json(body, { status: error.statusCode });
    }

    if (error instanceof ValidationError) {
      const body = ApiResponseBuilder.error(error.message, error.errors);
      return NextResponse.json(body, { status: 400 });
    }

    if (error instanceof DomainError) {
      const body = ApiResponseBuilder.error(error.message, { code: error.code });
      return NextResponse.json(body, { status: 422 });
    }

    if (error instanceof AppError) {
      const body = ApiResponseBuilder.error(error.message, { code: error.code });
      return NextResponse.json(body, { status: error.statusCode });
    }

    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[HttpResultHandler] Unhandled Error:", error);
    const body = ApiResponseBuilder.error(message);
    return NextResponse.json(body, { status: 500 });
  }
}
