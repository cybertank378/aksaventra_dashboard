import type { Prisma } from "@prisma/client";
import type { ListUsersQueryDTO } from "@/modules/users/domain/dto/UserRequestDTO";

export class UserQueryBuilder {
  public static buildWhere(query: ListUsersQueryDTO): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};
    const conditions: Prisma.UserWhereInput[] = [];

    // Search filter across name or email
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      conditions.push({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { email: { contains: term, mode: "insensitive" } },
        ],
      });
    }

    // Role filter
    if (query.role && query.role !== "ALL") {
      conditions.push({ role: query.role });
    }

    // Status filter
    if (query.accountState && query.accountState !== "ALL") {
      if (query.accountState === "ACTIVE") {
        conditions.push({ isActive: true });
      } else if (query.accountState === "INACTIVE" || query.accountState === "LOCKED") {
        conditions.push({ isActive: false });
      }
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    return where;
  }

  public static buildOrderBy(
    sortBy?: "name" | "email" | "role" | "createdAt" | "lastLoginAt",
    sortOrder: "asc" | "desc" = "desc",
  ): Prisma.UserOrderByWithRelationInput {
    const field = sortBy ?? "createdAt";
    return {
      [field]: sortOrder,
    };
  }
}
