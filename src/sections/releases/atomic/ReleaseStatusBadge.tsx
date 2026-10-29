"use client";

import type React from "react";
import Badge from "@/shared-ui/component/Badge";

interface ReleaseStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export const ReleaseStatusBadge: React.FC<ReleaseStatusBadgeProps> = ({ isActive, className }) => {
  if (isActive) {
    return (
      <Badge color="success" variant="soft" className={className}>
        Aktif
      </Badge>
    );
  }

  return (
    <Badge color="secondary" variant="soft" className={className}>
      Nonaktif
    </Badge>
  );
};
