import { Activity, Clock } from "lucide-react";
import type React from "react";
import type { DashboardActivityDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import { formatDisplayDate } from "@/modules/dashboards/presentation/helpers/chartFormatters";
import Card from "@/shared-ui/component/Card";
import Skeleton from "@/shared-ui/component/Skeleton";

export interface RecentActivityListProps {
  activities?: DashboardActivityDTO[];
  loading?: boolean;
}

export function RecentActivityList({
  activities,
  loading = false,
}: RecentActivityListProps): React.JSX.Element {
  if (loading) {
    return (
      <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs">
        <Skeleton className="w-1/2 h-5 mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`act-skel-${i}`} className="flex items-center gap-3">
              <Skeleton circle className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-3/4 h-3.5 mb-1" />
                <Skeleton className="w-1/2 h-2.5" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const items = activities ?? [];

  return (
    <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Riwayat Aktivitas</h3>
          <p className="mt-0.5 text-xs text-slate-500">Log operasional administrator & engine</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
          <Clock className="h-4 w-4" />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <p className="text-xs font-semibold text-slate-600">Belum ada aktivitas tercatat</p>
          <p className="mt-1 text-[11px] text-slate-400">
            Aksi admin atau sistem akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100 overflow-y-auto">
          {items.map((act) => (
            <div key={act.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {act.details || act.action}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700 truncate">{act.actorName}</span>
                  <span>•</span>
                  <span>{formatDisplayDate(act.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default RecentActivityList;
