"use client";

import type React from "react";
import type { ReleaseChannelType } from "@/modules/releases/domain/value-object/ReleaseChannelVO";
import Badge from "@/shared-ui/component/Badge";

interface ReleaseChannelBadgeProps {
  channel: ReleaseChannelType | string;
  className?: string;
}

export const ReleaseChannelBadge: React.FC<ReleaseChannelBadgeProps> = ({ channel, className }) => {
  const norm = channel.toUpperCase();

  if (norm === "STABLE") {
    return (
      <Badge color="success" variant="soft" className={className}>
        STABLE
      </Badge>
    );
  }

  if (norm === "BETA") {
    return (
      <Badge color="info" variant="soft" className={className}>
        BETA
      </Badge>
    );
  }

  return (
    <Badge color="warning" variant="soft" className={className}>
      NIGHTLY
    </Badge>
  );
};
