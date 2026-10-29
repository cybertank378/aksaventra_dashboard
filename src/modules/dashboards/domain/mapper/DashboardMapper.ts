import type {
  DashboardActivityDTO,
  DistributionChartResponseDTO,
  RecentLicenseItemDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { LicenseExpiryRule } from "@/modules/dashboards/domain/rules/LicenseExpiryRule";

export interface RawLicenseRecord {
  id: string;
  serialKey: string;
  clientName: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED";
  hwid: string | null;
  expiresAt: Date | null;
  engineVersion: string | null;
  createdAt: Date;
}

export interface RawAuditLogRecord {
  id: string;
  action: string;
  target: string | null;
  details: string | null;
  createdAt: Date;
  user?: {
    name: string | null;
    email: string;
  } | null;
}

export class DashboardMapper {
  public static maskSerialKey(rawKey: string): string {
    const cleanKey = (rawKey ?? "").trim();
    if (cleanKey.length < 8) {
      return cleanKey ? `••••-${cleanKey.slice(-4)}` : "••••-••••";
    }

    const first4 = cleanKey.slice(0, 4);
    const last4 = cleanKey.slice(-4);
    return `${first4}-••••-••••-${last4}`;
  }

  public static toRecentLicenseDTO(raw: RawLicenseRecord, now: Date): RecentLicenseItemDTO {
    const calculatedStatus = LicenseExpiryRule.evaluate(raw.status, raw.expiresAt, now);
    const hwidStatus = raw.hwid && raw.hwid.trim().length > 0 ? "BOUND" : "UNBOUND";

    return {
      id: raw.id,
      clientName: raw.clientName,
      serialKeyMasked: DashboardMapper.maskSerialKey(raw.serialKey),
      engineVersion: raw.engineVersion ?? "v2.2.1",
      hwidStatus,
      status: calculatedStatus,
      expiresAt: raw.expiresAt ? raw.expiresAt.toISOString() : null,
      createdAt: raw.createdAt.toISOString(),
    };
  }

  public static toActivityDTO(raw: RawAuditLogRecord): DashboardActivityDTO {
    const actorName = raw.user?.name ?? raw.user?.email ?? "Sistem";

    return {
      id: raw.id,
      action: raw.action,
      actorName,
      details: raw.details ?? null,
      target: raw.target ?? null,
      createdAt: raw.createdAt.toISOString(),
    };
  }

  public static toDistributionDTO(counts: {
    active: number;
    expiringSoon: number;
    expired: number;
    suspended: number;
  }): DistributionChartResponseDTO {
    const total = counts.active + counts.expiringSoon + counts.expired + counts.suspended;

    const calcPercent = (val: number): number => {
      if (total === 0) return 0;
      return Math.round((val / total) * 1000) / 10;
    };

    return {
      total,
      slices: [
        {
          key: "ACTIVE",
          label: "Lisensi Aktif",
          value: counts.active,
          percent: calcPercent(counts.active),
        },
        {
          key: "EXPIRING_SOON",
          label: "Segera Habis",
          value: counts.expiringSoon,
          percent: calcPercent(counts.expiringSoon),
        },
        {
          key: "EXPIRED",
          label: "Kedaluwarsa",
          value: counts.expired,
          percent: calcPercent(counts.expired),
        },
        {
          key: "SUSPENDED",
          label: "Dicabut / Ditangguhkan",
          value: counts.suspended,
          percent: calcPercent(counts.suspended),
        },
      ],
    };
  }
}
