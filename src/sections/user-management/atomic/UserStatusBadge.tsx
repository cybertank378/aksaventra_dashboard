"use client";

import type { UserAccountState } from "@/modules/users/domain/dto/UserResponseDTO";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";

interface UserStatusBadgeProps {
  state: UserAccountState;
  className?: string;
}

export const UserStatusBadge = ({ state, className }: UserStatusBadgeProps) => {
  let label = "Aktif";
  let color: BadgeColor = "success";

  switch (state) {
    case "ACTIVE":
      label = "Aktif";
      color = "success";
      break;
    case "LOCKED":
      label = "Terkunci (Brute-Force)";
      color = "error";
      break;
    case "INACTIVE":
      label = "Nonaktif";
      color = "secondary";
      break;
  }

  return (
    <Badge color={color} variant="soft" className={className}>
      <span className="flex items-center gap-1.5 font-medium">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            state === "ACTIVE"
              ? "bg-emerald-500 animate-pulse"
              : state === "LOCKED"
                ? "bg-rose-500"
                : "bg-slate-400"
          }`}
        />
        {label}
      </span>
    </Badge>
  );
};
