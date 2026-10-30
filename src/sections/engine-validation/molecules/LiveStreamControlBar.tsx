import { Pause, Play, RefreshCw, ShieldCheck } from "lucide-react";
import LivePulseBadge from "@/sections/engine-validation/atomic/LivePulseBadge";
import Button from "@/shared-ui/component/Button";

interface LiveStreamControlBarProps {
  isPaused: boolean;
  pollIntervalMs: number;
  onTogglePause: () => void;
  onIntervalChange: (intervalMs: number) => void;
  onOpenSimulator: () => void;
  onManualRefresh: () => void;
  refreshing?: boolean;
}

export default function LiveStreamControlBar({
  isPaused,
  pollIntervalMs,
  onTogglePause,
  onIntervalChange,
  onOpenSimulator,
  onManualRefresh,
  refreshing = false,
}: LiveStreamControlBarProps) {
  const intervals = [
    { label: "5 detik", value: 5000 },
    { label: "10 detik", value: 10000 },
    { label: "30 detik", value: 30000 },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <LivePulseBadge isPaused={isPaused} intervalMs={pollIntervalMs} />
        <span className="hidden text-xs text-slate-400 sm:inline">•</span>
        <p className="hidden text-xs text-slate-500 sm:inline">
          Otomatis diperbarui via background polling
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Toggle Pause / Resume */}
        <Button
          variant={isPaused ? "filled" : "outline"}
          color={isPaused ? "primary" : "secondary"}
          size="sm"
          leftIcon={isPaused ? Play : Pause}
          onClick={onTogglePause}
        >
          {isPaused ? "Lanjutkan Stream" : "Jeda Stream"}
        </Button>

        {/* Interval Dropdown/Buttons */}
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-xs">
          {intervals.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={pollIntervalMs === item.value ? "filled" : "ghost"}
              color={pollIntervalMs === item.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => onIntervalChange(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Manual Refresh */}
        <Button
          variant="outline"
          color="secondary"
          size="sm"
          leftIcon={RefreshCw}
          loading={refreshing}
          onClick={onManualRefresh}
          title="Refresh Data Sekarang"
        >
          Segarkan
        </Button>

        {/* Simulator Button */}
        <Button
          variant="filled"
          color="primary"
          size="sm"
          leftIcon={ShieldCheck}
          onClick={onOpenSimulator}
        >
          Uji Validasi Key
        </Button>
      </div>
    </div>
  );
}
