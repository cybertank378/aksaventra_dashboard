import type { LiveFeedQueryDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type { LiveFeedGroup } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

export interface PrismaValidationLogWhere {
  AND?: unknown[];
  result?: { in?: string[]; notIn?: string[] } | string;
  statusCode?: { in?: number[]; gte?: number };
  engineVersion?: string;
  OR?: unknown[];
}

export class LiveFeedQueryBuilder {
  public static buildWhere(query: LiveFeedQueryDTO): PrismaValidationLogWhere {
    const conditions: unknown[] = [];

    // Filter berdasarkan Group
    if (query.group && query.group !== "ALL") {
      const groupCondition = LiveFeedQueryBuilder.buildGroupFilter(query.group);
      if (groupCondition) {
        conditions.push(groupCondition);
      }
    }

    // Filter berdasarkan Engine Version
    if (query.engineVersion && query.engineVersion.trim() !== "") {
      conditions.push({
        engineVersion: query.engineVersion.trim(),
      });
    }

    // Filter Search (serialKeyHint, clientIp, hwidHash, atau clientName pada relasi license)
    if (query.search && query.search.trim() !== "") {
      const term = query.search.trim();
      conditions.push({
        OR: [
          { serialKeyHint: { contains: term, mode: "insensitive" } },
          { hwidHash: { contains: term, mode: "insensitive" } },
          { clientIp: { contains: term, mode: "insensitive" } },
          { engineVersion: { contains: term, mode: "insensitive" } },
          {
            license: {
              clientName: { contains: term, mode: "insensitive" },
            },
          },
        ],
      });
    }

    if (conditions.length === 0) {
      return {};
    }

    return {
      AND: conditions,
    };
  }

  private static buildGroupFilter(group: LiveFeedGroup): unknown {
    switch (group) {
      case "VERIFIED":
        return {
          result: "VERIFIED",
          statusCode: 200,
        };
      case "ACTIVATED":
        return {
          result: "ACTIVATED",
          statusCode: 200,
        };
      case "MISMATCH":
        return {
          OR: [{ result: "HWID_MISMATCH" }, { statusCode: 403 }],
        };
      case "REJECTED":
        return {
          OR: [
            { statusCode: { gte: 400 } },
            {
              result: {
                in: [
                  "EXPIRED",
                  "SUSPENDED",
                  "REVOKED",
                  "NOT_FOUND",
                  "BAD_REQUEST",
                  "HWID_MISMATCH",
                ],
              },
            },
          ],
        };
      default:
        return null;
    }
  }
}
