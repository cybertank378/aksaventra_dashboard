"use client";

import type { LicenseValidationResult } from "@prisma/client";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";

interface Props {
  result: LicenseValidationResult;
  className?: string;
}

interface ResultConfig {
  label: string;
  color: BadgeColor;
}

const RESULT_MAP: Record<LicenseValidationResult, ResultConfig> = {
  VERIFIED: {
    label: "Terverifikasi (200)",
    color: "success",
  },
  ACTIVATED: {
    label: "Aktivasi Baru (200)",
    color: "info",
  },
  HWID_MISMATCH: {
    label: "HWID Mismatch (403)",
    color: "error",
  },
  EXPIRED: {
    label: "Kedaluwarsa (401)",
    color: "warning",
  },
  SUSPENDED: {
    label: "Dibekukan (401)",
    color: "error",
  },
  NOT_FOUND: {
    label: "Key Tidak Dikenal (404)",
    color: "secondary",
  },
  BAD_REQUEST: {
    label: "Payload Invalid (400)",
    color: "secondary",
  },
};

export const ValidationResultBadge = ({ result, className }: Props) => {
  const config = RESULT_MAP[result] ?? {
    label: String(result),
    color: "secondary" as BadgeColor,
  };

  return (
    <Badge color={config.color} variant="soft" className={className}>
      {config.label}
    </Badge>
  );
};
