import clsx from "clsx";
import type { BinaryIntegrityOutcome } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";

interface ChecksumMatchBadgeProps {
  outcome: BinaryIntegrityOutcome;
  className?: string;
}

export default function ChecksumMatchBadge({ outcome, className }: ChecksumMatchBadgeProps) {
  switch (outcome) {
    case "VALID":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
            className,
          )}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Checksum Sah (Valid #39)
        </span>
      );
    case "HASH_MISMATCH":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700",
            className,
          )}
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Hash Mismatch (Terindikasi Modifikasi)
        </span>
      );
    case "REVOKED":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700",
            className,
          )}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Biner Dicabut (Revoked)
        </span>
      );
    case "UNKNOWN_VERSION":
      return (
        <span
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600",
            className,
          )}
        >
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          Versi Tidak Terdaftar
        </span>
      );
    default:
      return null;
  }
}
