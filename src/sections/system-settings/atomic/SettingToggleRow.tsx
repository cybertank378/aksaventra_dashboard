"use client";

import Badge from "@/shared-ui/component/Badge";
import Switch from "@/shared-ui/component/Switch";

interface SettingToggleRowProps {
  name: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badgeText?: string;
  badgeVariant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  disabled?: boolean;
}

export function SettingToggleRow({
  name,
  label,
  description,
  checked,
  onChange,
  badgeText,
  badgeVariant = "info",
  disabled = false,
}: SettingToggleRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-b-0">
      <div className="space-y-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          {badgeText && <Badge color={badgeVariant}>{badgeText}</Badge>}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{description}</p>
      </div>

      <div className="flex-shrink-0">
        <Switch
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          variant="primary"
        />
      </div>
    </div>
  );
}
