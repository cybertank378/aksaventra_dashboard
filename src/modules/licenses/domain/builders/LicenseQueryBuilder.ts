import type { Prisma } from "@prisma/client";
import type { LicenseQueryDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";

export class LicenseQueryBuilder {
  public static buildWhere(
    query: LicenseQueryDTO,
    now: Date = new Date(),
  ): Prisma.LicenseWhereInput {
    const where: Prisma.LicenseWhereInput = {};
    const conditions: Prisma.LicenseWhereInput[] = [];

    // Search filter across clientName, serialKey, or hwid
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      conditions.push({
        OR: [
          { clientName: { contains: term, mode: "insensitive" } },
          { serialKey: { contains: term, mode: "insensitive" } },
          { hwid: { contains: term, mode: "insensitive" } },
        ],
      });
    }

    // Status filter
    if (query.status && query.status !== "ALL") {
      conditions.push({ status: query.status });
    }

    // Binding filter
    if (query.binding === "BOUND") {
      conditions.push({
        hwid: { not: null },
      });
    } else if (query.binding === "UNBOUND") {
      conditions.push({
        hwid: null,
      });
    }

    // Expiring soon filter (expires within 30 days and status is ACTIVE)
    if (query.expiringSoon) {
      const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      conditions.push({
        status: "ACTIVE",
        expiresAt: {
          gt: now,
          lte: thirtyDaysAhead,
        },
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    return where;
  }

  public static buildOrderBy(
    sortBy?: "createdAt" | "expiresAt" | "lastVerifiedAt" | "clientName",
    sortOrder: "asc" | "desc" = "desc",
  ): Prisma.LicenseOrderByWithRelationInput {
    const field = sortBy ?? "createdAt";
    return {
      [field]: sortOrder,
    };
  }
}
