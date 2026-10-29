import { TrendingUp } from "lucide-react";
import type React from "react";

export interface KpiTrendIndicatorProps {
  growthRate: number;
  label?: string;
}

export function KpiTrendIndicator({
  growthRate,
  label = "bulan ini",
}: KpiTrendIndicatorProps): React.JSX.Element {
  const isPositive = growthRate > 0;
  const isNeutral = growthRate === 0;

  const bgClass = isNeutral
    ? "bg-slate-100 text-slate-600"
    : isPositive
      ? "bg-emerald-50 text-emerald-700"
      : "bg-rose-50 text-rose-700";

  const displayRate = `${isPositive ? "+" : ""}${growthRate.toFixed(1)}%`;

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold">
      <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 ${bgClass}`}>
        {!isNeutral &&
          (isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingUp className="h-3 w-3 rotate-180" />
          ))}
        <span className="tabular-nums">{displayRate}</span>
      </span>
      <span className="text-slate-500 font-normal">{label}</span>
    </div>
  );
}

export default KpiTrendIndicator;
