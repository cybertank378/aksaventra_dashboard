"use client";

import { Smartphone } from "lucide-react";
import Badge from "@/shared-ui/component/Badge";

interface ActiveSessionCounterChipProps {
  count: number;
  className?: string;
}

export const ActiveSessionCounterChip = ({ count, className }: ActiveSessionCounterChipProps) => {
  if (count <= 0) {
    return <span className="text-xs text-slate-400 font-normal">Tidak ada sesi</span>;
  }

  return (
    <Badge color={count > 3 ? "warning" : "info"} variant="soft" className={className}>
      <span className="flex items-center gap-1 font-medium">
        <Smartphone className="w-3 h-3" />
        {count} {count === 1 ? "Sesi" : "Sesi"}
      </span>
    </Badge>
  );
};
