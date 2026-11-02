import clsx from "clsx";

interface SlaHealthBadgeProps {
  latencyMs?: number | null;
  compliancePercent?: number;
  className?: string;
}

export default function SlaHealthBadge({
  latencyMs,
  compliancePercent,
  className,
}: SlaHealthBadgeProps) {
  if (typeof compliancePercent === "number") {
    const isOptimal = compliancePercent >= 98;
    const isWarning = compliancePercent >= 90 && compliancePercent < 98;

    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
          isOptimal && "border border-emerald-200 bg-emerald-50 text-emerald-700",
          isWarning && "border border-amber-200 bg-amber-50 text-amber-700",
          !isOptimal && !isWarning && "border border-red-200 bg-red-50 text-red-700",
          className,
        )}
      >
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            isOptimal && "bg-emerald-500",
            isWarning && "bg-amber-500",
            !isOptimal && !isWarning && "bg-red-500",
          )}
        />
        {compliancePercent.toFixed(1)}% SLA
      </span>
    );
  }

  if (typeof latencyMs !== "number" || latencyMs < 0) {
    return (
      <span
        className={clsx(
          "inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500",
          className,
        )}
      >
        - ms
      </span>
    );
  }

  if (latencyMs < 100) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700",
          className,
        )}
      >
        <span>⚡</span> {latencyMs} ms (Optimal)
      </span>
    );
  }

  if (latencyMs < 200) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700",
          className,
        )}
      >
        <span>⏱</span> {latencyMs} ms (Normal)
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700",
        className,
      )}
    >
      <span>⚠</span> {latencyMs} ms (Breached SLA)
    </span>
  );
}
