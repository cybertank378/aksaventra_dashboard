"use client";

import type { LucideIcon } from "lucide-react";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";
import Card from "@/shared-ui/component/Card";

interface Props {
  title: string;
  value: string | number;
  subtitle: string;
  badgeText?: string;
  badgeColor?: BadgeColor;
  icon: LucideIcon;
}

export default function LicenseMetricCard({
  title,
  value,
  subtitle,
  badgeText,
  badgeColor = "primary",
  icon: Icon,
}: Props) {
  return (
    <Card className="flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{subtitle}</span>
        {badgeText && (
          <Badge color={badgeColor} variant="soft">
            {badgeText}
          </Badge>
        )}
      </div>
    </Card>
  );
}

