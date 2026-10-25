import { ApiError } from "./errors/ApiError";

export class RouteParamHelper {
  public static async getRequiredParam(
    paramsPromise:
      | Promise<Record<string, string | string[] | undefined>>
      | Record<string, string | string[] | undefined>,
    paramName: string,
  ): Promise<string> {
    const params = await Promise.resolve(paramsPromise);
    const value = params[paramName];

    if (!value || typeof value !== "string" || value.trim() === "") {
      throw ApiError.badRequest(`Missing or invalid route parameter: '${paramName}'`);
    }

    return value.trim();
  }
}
