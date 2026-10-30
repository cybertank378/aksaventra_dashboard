"use client";

import clsx from "clsx";
import { LatencyThresholdRule } from "@/modules/validation-logs/domain/rules/LatencyThresholdRule";

interface Props {
  latencyMs: number | null | undefined;
  className?: string;
}

export const LatencyIndicator = ({ latencyMs, className }: Props) => {
  if (latencyMs === null || latencyMs === undefined) {
    return <span className={clsx("text-xs text-slate-400", className)}>-</span>;
  }

  const category = LatencyThresholdRule.evaluate(latencyMs);

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-mono font-medium border",
        category === "OPTIMAL" && "bg-emerald-50 text-emerald-700 border-emerald-200",
        category === "ACCEPTABLE" && "bg-amber-50 text-amber-700 border-amber-200",
        category === "BREACHED" && "bg-rose-50 text-rose-700 border-rose-200 font-bold",
        className,
      )}
      title={
        category === "BREACHED"
          ? "Melebihi target SLA latency (<200 ms)"
          : category === "OPTIMAL"
            ? "Performa optimal (<100 ms)"
            : "Dalam batas normal (<200 ms)"
      }
    >
      {latencyMs} ms
    </span>
  );
};
