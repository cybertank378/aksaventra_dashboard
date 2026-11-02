"use client";

import type { LucideIcon } from "lucide-react";
import Badge from "@/shared-ui/component/Badge";

interface DiagnosticStatusItemProps {
  title: string;
  subtitle: string;
  statusLabel: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  icon: LucideIcon;
}

export function DiagnosticStatusItem({
  title,
  subtitle,
  statusLabel,
  badgeVariant = "success",
  icon: Icon,
}: DiagnosticStatusItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex-shrink-0">
        <Badge color={badgeVariant}>{statusLabel}</Badge>
      </div>
    </div>
  );
}
