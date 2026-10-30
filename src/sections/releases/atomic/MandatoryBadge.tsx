"use client";

import type React from "react";
import Badge from "@/shared-ui/component/Badge";

interface MandatoryBadgeProps {
  mandatory: boolean;
  className?: string;
}

export const MandatoryBadge: React.FC<MandatoryBadgeProps> = ({ mandatory, className }) => {
  if (mandatory) {
    return (
      <Badge color="error" variant="soft" className={className}>
        Wajib Update
      </Badge>
    );
  }

  return (
    <Badge color="secondary" variant="soft" className={className}>
      Opsional
    </Badge>
  );
};
