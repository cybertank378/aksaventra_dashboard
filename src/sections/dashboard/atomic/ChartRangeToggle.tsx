"use client";

import type React from "react";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";

export interface ChartRangeToggleProps {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
}

const RANGE_OPTIONS: Array<{ label: string; value: ChartRange }> = [
  { label: "7H", value: "7d" },
  { label: "30H", value: "30d" },
  { label: "90H", value: "90d" },
];

export function ChartRangeToggle({ value, onChange }: ChartRangeToggleProps): React.JSX.Element {
  const handleSelect7d = () => onChange("7d");
  const handleSelect30d = () => onChange("30d");
  const handleSelect90d = () => onChange("90d");

  const handlers: Record<ChartRange, () => void> = {
    "7d": handleSelect7d,
    "30d": handleSelect30d,
    "90d": handleSelect90d,
  };

  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
      {RANGE_OPTIONS.map((opt) => {
        const isSelected = value === opt.value;
        const handler = handlers[opt.value];

        return (
          <button
            key={opt.value}
            type="button"
            onClick={handler}
            className={`cursor-pointer rounded-md px-2.5 py-1 transition-all ${
              isSelected
                ? "bg-white text-blue-600 shadow-xs shadow-slate-200 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default ChartRangeToggle;
