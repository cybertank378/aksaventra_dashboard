import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";

interface AuditActionBadgeProps {
  action: string;
}

export const AuditActionBadge: FC<AuditActionBadgeProps> = ({ action }) => {
  const normAction = action.toUpperCase();

  if (normAction.includes("SUCCESS") || normAction.includes("VALID")) {
    return (
      <Badge
        color="success"
        variant="soft"
        className="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5"
      >
        {action}
      </Badge>
    );
  }

  if (
    normAction.includes("FAILED") ||
    normAction.includes("SUSPEND") ||
    normAction.includes("REVOKE") ||
    normAction.includes("LOCKED")
  ) {
    return (
      <Badge
        color="error"
        variant="soft"
        className="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5"
      >
        {action}
      </Badge>
    );
  }

  if (
    normAction.includes("RESET") ||
    normAction.includes("UPDATE") ||
    normAction.includes("PURGE")
  ) {
    return (
      <Badge
        color="warning"
        variant="soft"
        className="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5"
      >
        {action}
      </Badge>
    );
  }

  if (normAction.includes("CREATE") || normAction.includes("RELEASE")) {
    return (
      <Badge
        color="info"
        variant="soft"
        className="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5"
      >
        {action}
      </Badge>
    );
  }

  return (
    <Badge
      color="secondary"
      variant="soft"
      className="font-mono text-[10px] tracking-wide uppercase px-2 py-0.5"
    >
      {action}
    </Badge>
  );
};
