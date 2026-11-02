import clsx from "clsx";

interface LivePulseBadgeProps {
  isPaused: boolean;
  intervalMs: number;
  className?: string;
}

export default function LivePulseBadge({ isPaused, intervalMs, className }: LivePulseBadgeProps) {
  const intervalSeconds = Math.round(intervalMs / 1000);

  if (isPaused) {
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600",
          className,
        )}
      >
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        STREAM DIJEDA
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
        className,
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      LIVE STREAM AKTIF ({intervalSeconds}d)
    </span>
  );
}
