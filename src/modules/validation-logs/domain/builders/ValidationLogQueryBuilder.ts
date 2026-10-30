import type { Prisma } from "@prisma/client";
import type { ListValidationLogsQueryDTO } from "../dto/ValidationLogRequestDTO";

export class ValidationLogQueryBuilder {
  public static buildWhereClause(
    params: ListValidationLogsQueryDTO,
  ): Prisma.LicenseValidationLogWhereInput {
    const where: Prisma.LicenseValidationLogWhereInput = {};

    // 1. Group / Result filter
    if (params.result) {
      where.result = params.result;
    } else if (params.group && params.group !== "ALL") {
      switch (params.group) {
        case "SUCCESS":
          where.result = { in: ["ACTIVATED", "VERIFIED"] };
          break;
        case "MISMATCH":
          where.result = "HWID_MISMATCH";
          break;
        case "REJECTED":
          where.result = { in: ["EXPIRED", "SUSPENDED", "NOT_FOUND", "BAD_REQUEST"] };
          break;
      }
    }

    // 2. Engine Version filter
    if (params.engineVersion && params.engineVersion.trim() !== "") {
      where.engineVersion = params.engineVersion.trim();
    }

    // 3. Date range filter
    if (params.startDate || params.endDate) {
      const checkedAtFilter: Prisma.DateTimeFilter = {};
      if (params.startDate) {
        checkedAtFilter.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        checkedAtFilter.lte = new Date(params.endDate);
      }
      where.checkedAt = checkedAtFilter;
    }

    // 4. Search filter across hint, IP, or clientName
    if (params.search && params.search.trim() !== "") {
      const term = params.search.trim();
      where.OR = [
        { serialKeyHint: { contains: term, mode: "insensitive" } },
        { clientIp: { contains: term, mode: "insensitive" } },
        {
          license: {
            clientName: { contains: term, mode: "insensitive" },
          },
        },
      ];
    }

    return where;
  }
}
