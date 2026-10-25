import type { NextRequest, NextResponse } from "next/server";
import { HttpResultHandler } from "./HttpResultHandler";
import { type ParsedQueryParams, QueryParamsHelper } from "./QueryParams";

export abstract class BaseController {
  protected abstract handle(req: NextRequest, params?: unknown): Promise<NextResponse>;

  public async execute(req: NextRequest, params?: unknown): Promise<NextResponse> {
    try {
      return await this.handle(req, params);
    } catch (error) {
      return HttpResultHandler.handleError(error);
    }
  }

  protected getQueryParams(req: NextRequest): ParsedQueryParams {
    return QueryParamsHelper.parse(req.nextUrl.searchParams);
  }

  protected async getBody<T>(req: NextRequest): Promise<T> {
    return (await req.json()) as T;
  }
}
