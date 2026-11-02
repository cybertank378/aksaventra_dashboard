import { CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import type { EngineMonitorSummaryResponseDTO } from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import Badge from "@/shared-ui/component/Badge";
import Card from "@/shared-ui/component/Card";

interface EngineHealthOverviewRowProps {
  summary: EngineMonitorSummaryResponseDTO | null;
}

export default function EngineHealthOverviewRow({ summary }: EngineHealthOverviewRowProps) {
  const breakdown = summary?.outcomeBreakdown24h ?? {
    verifiedCount: 0,
    activatedCount: 0,
    mismatchCount: 0,
    rejectedCount: 0,
    totalCount: 0,
  };

  const total = breakdown.totalCount || 1;
  const verifiedRate = Math.round((breakdown.verifiedCount / total) * 1000) / 10;
  const activatedRate = Math.round((breakdown.activatedCount / total) * 1000) / 10;
  const mismatchRate = Math.round((breakdown.mismatchCount / total) * 1000) / 10;
  const rejectedRate = Math.round((breakdown.rejectedCount / total) * 1000) / 10;

  const clientVersions = summary?.clientVersionDistribution ?? [];
  const latestRelease = summary?.latestActiveRelease;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* 8 Kolom: Distribusi Respons & SLA */}
      <Card className="p-6 lg:col-span-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Distribusi Latensi & Status Respons (24 Jam)
            </h4>
            <p className="text-xs text-slate-500">
              Proporsi hasil pemeriksaan otentikasi engine klien di seluruh jaringan
            </p>
          </div>
          <Badge color="secondary" variant="soft">
            Total {breakdown.totalCount.toLocaleString("id-ID")} Sampel
          </Badge>
        </div>

        {/* Visual Bar Gabungan */}
        <div className="mt-5 space-y-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              style={{ width: `${verifiedRate}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Terverifikasi: ${verifiedRate}%`}
            />
            <div
              style={{ width: `${activatedRate}%` }}
              className="bg-blue-500 transition-all duration-500"
              title={`Aktivasi Baru: ${activatedRate}%`}
            />
            <div
              style={{ width: `${mismatchRate}%` }}
              className="bg-amber-500 transition-all duration-500"
              title={`HWID Mismatch: ${mismatchRate}%`}
            />
            <div
              style={{ width: `${rejectedRate}%` }}
              className="bg-red-500 transition-all duration-500"
              title={`Ditolak/Lainnya: ${rejectedRate}%`}
            />
          </div>

          {/* Rincian Baris */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                200 Terverifikasi
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">{verifiedRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">
                {breakdown.verifiedCount.toLocaleString("id-ID")} permintaan
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                200 Aktivasi Baru
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">{activatedRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">
                {breakdown.activatedCount.toLocaleString("id-ID")} lisensi
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                403 HWID Mismatch
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">{mismatchRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">
                {breakdown.mismatchCount.toLocaleString("id-ID")} insiden
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                4xx Ditolak
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900">{rejectedRate.toFixed(1)}%</p>
              <p className="text-xs text-slate-500">
                {breakdown.rejectedCount.toLocaleString("id-ID")} kasus
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Kolom: Kepatuhan Versi Klien & Checksum Aktif */}
      <Card className="flex flex-col justify-between p-6 lg:col-span-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">Kepatuhan Versi Biner Klien</h4>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>

          <div className="mt-4 space-y-3">
            {clientVersions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Belum ada data telemetri versi engine
              </p>
            ) : (
              clientVersions.slice(0, 4).map((item) => (
                <div key={item.engineVersion} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {item.isLatestStable ? (
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    ) : (
                      <ShieldAlert size={14} className="text-amber-500" />
                    )}
                    <span className="font-semibold text-slate-800">{item.engineVersion}</span>
                    {item.isLatestStable && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        STABLE
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{item.percent.toFixed(0)}%</span>
                    <span className="text-slate-400 ml-1">({item.deviceCount})</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info Checksum SHA-256 Rilis Aktif */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Checksum Resmi Aktif (Isu #39)
          </p>
          <p className="mt-1 font-mono text-[11px] text-slate-700 break-all select-all">
            {latestRelease?.checksumSha256 ?? "Belum ada rilis engine aktif"}
          </p>
          {latestRelease && (
            <p className="mt-1 text-[10px] text-slate-400">
              Rilis {latestRelease.version} ({latestRelease.channel})
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
