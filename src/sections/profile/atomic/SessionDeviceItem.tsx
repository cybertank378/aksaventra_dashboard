import { Laptop, Smartphone } from "lucide-react";
import type { FC } from "react";
import type { SessionItemDTO } from "@/modules/auth/domain/dto/ProfileDTO";
import Badge from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";

interface SessionDeviceItemProps {
  session: SessionItemDTO;
  onRevoke: (id: string) => void;
  isRevoking?: boolean;
}

export const SessionDeviceItem: FC<SessionDeviceItemProps> = ({
  session,
  onRevoke,
  isRevoking = false,
}) => {
  const isMobile =
    session.userAgent?.toLowerCase().includes("mobile") ||
    session.userAgent?.toLowerCase().includes("android") ||
    session.userAgent?.toLowerCase().includes("iphone");

  const Icon = isMobile ? Smartphone : Laptop;

  const formattedDate = new Date(session.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleRevokeClick = () => {
    onRevoke(session.id);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
        session.isCurrent
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-slate-200 bg-white hover:bg-slate-50/60"
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
            session.isCurrent
              ? "border-emerald-300 bg-emerald-100/70 text-emerald-700"
              : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-900">
            {session.userAgent || "Perangkat Tidak Dikenal"}
            {session.isCurrent && (
              <span className="ml-2 font-normal text-emerald-700 font-sans text-[11px]">
                (Sesi Saat Ini)
              </span>
            )}
          </p>
          <p className="truncate text-[11px] text-slate-500 font-mono mt-0.5">
            IP: {session.ipAddress || "Unknown"} • Aktif sejak {formattedDate} WIB
          </p>
        </div>
      </div>

      <div className="shrink-0 ml-3">
        {session.isCurrent ? (
          <Badge color="success" variant="soft" className="text-xs font-semibold px-3 py-1">
            Perangkat Ini
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            color="error"
            size="sm"
            onClick={handleRevokeClick}
            disabled={isRevoking}
          >
            {isRevoking ? "Memproses..." : "Cabut Sesi"}
          </Button>
        )}
      </div>
    </div>
  );
};
