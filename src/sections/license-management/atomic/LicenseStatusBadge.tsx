"use client";

import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";

export type LicenseDisplayStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED" | "REVOKED";

interface Props {
  status: LicenseDisplayStatus;
}

const statusColorMap: Record<LicenseDisplayStatus, BadgeColor> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  EXPIRED: "secondary",
  REVOKED: "error",
};

const statusLabelMap: Record<LicenseDisplayStatus, string> = {
  ACTIVE: "Aktif",
  SUSPENDED: "Ditangguhkan",
  EXPIRED: "Kedaluwarsa",
  REVOKED: "Dicabut",
};

export default function LicenseStatusBadge({ status }: Props) {
  return (
    <Badge color={statusColorMap[status]} variant="soft">
      {statusLabelMap[status]}
    </Badge>
  );
}
