import { Activity, AlertTriangle, Cpu, Gauge } from "lucide-react";
import type { EngineMonitorSummaryResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import SlaHealthBadge from "@/sections/engine-validation/atomic/SlaHealthBadge";
import Card from "@/shared-ui/component/Card";
import Skeleton from "@/shared-ui/component/Skeleton";

interface EngineMonitorKpiGridProps {
  summary: EngineMonitorSummaryResponseDTO | null;
  loading?: boolean;
}

export default function EngineMonitorKpiGrid({
  summary,
  loading = false,
}: EngineMonitorKpiGridProps) {
  if (loading && !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-28 mb-3" />
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-4 w-44" />
          </Card>
        ))}
      </div>
    );
  }

  const requestsLast15m = summary?.requestsLast15m ?? 0;
  const requestsPerMinute = summary?.requestsPerMinuteRate ?? 0;
  const slaCompliance = summary?.slaCompliancePercent24h ?? 100;
  const avgLatency = summary?.avgLatencyMs24h ?? 0;
  const p95Latency = summary?.p95LatencyMs24h ?? 0;
  const onlineDevices = summary?.onlineDevices24h ?? 0;
  const anomaliesCount = summary?.anomaliesLast1h ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Throughput */}
      <Card className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Throughput (15 Mnt)
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {requestsLast15m.toLocaleString("id-ID")}{" "}
              <span className="text-sm font-normal text-slate-500">req</span>
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Activity size={20} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>{requestsPerMinute.toFixed(1)} req/mnt</span>
          <SlaHealthBadge compliancePercent={slaCompliance} />
        </div>
      </Card>

      {/* KPI 2: Latensi SLA */}
      <Card className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kesehatan Latensi
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {avgLatency.toFixed(0)}{" "}
              <span className="text-sm font-normal text-slate-500">ms (rata-rata)</span>
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Gauge size={20} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>P95: {p95Latency.toFixed(0)} ms</span>
          <span className="font-medium text-emerald-700">Target &lt;200ms (NFR-01)</span>
        </div>
      </Card>

      {/* KPI 3: Perangkat Online */}
      <Card className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Perangkat Online
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {onlineDevices.toLocaleString("id-ID")}{" "}
              <span className="text-sm font-normal text-slate-500">mesin</span>
            </h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Cpu size={20} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>Heartbeat ≤ 24 Jam</span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Aktif Terhubung
          </span>
        </div>
      </Card>

      {/* KPI 4: Anomali & Mismatch */}
      <Card className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Anomali & Mismatch (1 Jam)
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              {anomaliesCount.toLocaleString("id-ID")}{" "}
              <span className="text-sm font-normal text-slate-500">penolakan</span>
            </h3>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              anomaliesCount > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>HWID Mismatch & 4xx</span>
          <span className={anomaliesCount > 0 ? "font-semibold text-amber-600" : "text-slate-400"}>
            {anomaliesCount > 0 ? "Perlu Peninjauan" : "Sistem Bersih"}
          </span>
        </div>
      </Card>
    </div>
  );
}
