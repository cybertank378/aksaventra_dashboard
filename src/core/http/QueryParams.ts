export interface ParsedQueryParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder: "asc" | "desc";
  search?: string;
  filters: Record<string, string>;
}

export class QueryParamsHelper {
  public static parse(searchParams: URLSearchParams): ParsedQueryParams {
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") ?? "10", 10) || 10),
    );
    const sortBy = searchParams.get("sortBy") ?? undefined;
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";
    const search = searchParams.get("search") ?? undefined;

    const reserved = new Set(["page", "limit", "sortBy", "sortOrder", "search"]);
    const filters: Record<string, string> = {};

    searchParams.forEach((val, key) => {
      if (!reserved.has(key)) {
        filters[key] = val;
      }
    });

    return {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      filters,
    };
  }
}
