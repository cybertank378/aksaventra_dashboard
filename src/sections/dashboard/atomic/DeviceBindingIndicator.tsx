import type React from "react";

export interface DeviceBindingIndicatorProps {
  status: "BOUND" | "UNBOUND";
}

export function DeviceBindingIndicator({ status }: DeviceBindingIndicatorProps): React.JSX.Element {
  const isBound = status === "BOUND";

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <span
        className={`h-2 w-2 rounded-full ${
          isBound ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-amber-400"
        }`}
      />
      <span className={isBound ? "text-slate-700" : "text-amber-700"}>
        {isBound ? "Terikat (HWID)" : "Belum Aktivasi"}
      </span>
    </div>
  );
}

export default DeviceBindingIndicator;
