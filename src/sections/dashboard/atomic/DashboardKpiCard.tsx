import type React from "react";
import Card from "@/shared-ui/component/Card";

export interface DashboardKpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
  trend?: React.ReactNode;
  subtext?: string;
  progressBarPercent?: number;
  progressBarColorClass?: string;
}

export function DashboardKpiCard({
  title,
  value,
  icon,
  iconBgClass = "bg-blue-50",
  iconColorClass = "text-blue-600",
  trend,
  subtext,
  progressBarPercent,
  progressBarColorClass = "bg-blue-600",
}: DashboardKpiCardProps): React.JSX.Element {
  return (
    <Card className="flex flex-col justify-between border-slate-200/90 p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass} ${iconColorClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-4">
        {progressBarPercent !== undefined && (
          <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${progressBarColorClass}`}
              style={{ width: `${Math.min(100, Math.max(0, progressBarPercent))}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs">
          {trend && <div>{trend}</div>}
          {subtext && <p className="text-slate-500">{subtext}</p>}
        </div>
      </div>
    </Card>
  );
}

export default DashboardKpiCard;
