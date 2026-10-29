"use client";

import clsx from "clsx";
import { Lock } from "lucide-react";
import type { AuthTelemetryResponseDTO } from "@/modules/auth/domain/dto/AuthResponseDTO";
import Badge from "@/shared-ui/component/Badge";
import Card from "@/shared-ui/component/Card";

export interface AuthTelemetryCardProps {
  telemetry: AuthTelemetryResponseDTO | null;
  loading?: boolean;
}

export default function AuthTelemetryCard({ telemetry, loading = false }: AuthTelemetryCardProps) {
  const isOnline = telemetry?.online === true;

  const activeLicensesLabel = loading
    ? "..."
    : isOnline
      ? telemetry.activeLicenses.toLocaleString("id-ID")
      : "—";

  const utilizationLabel = loading ? "..." : isOnline ? `${telemetry.utilizationPercent}%` : "—";

  const latencyLabel = loading ? "..." : isOnline ? `${telemetry.latencyMs} ms` : "Offline";

  return (
    <Card className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div
            className={clsx(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              isOnline
                ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                : "border-amber-200 bg-amber-50 text-amber-600",
            )}
          >
            <Lock size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Proteksi Kunci Kriptografi Aktif</h2>
            <p className="text-xs text-slate-500">
              {loading
                ? "Memeriksa koneksi telemetri database..."
                : isOnline
                  ? "Enkripsi End-to-End • TLS 1.3 Handshake"
                  : "Database Belum Tersambung • Menunggu Koneksi"}
            </p>
          </div>
        </div>

        <Badge
          color="info"
          variant="outline"
          className="rounded-lg !border-indigo-200 !bg-indigo-50/70 px-3 py-1 text-xs font-bold !text-indigo-600"
        >
          {telemetry?.algorithm ?? "SHA-256"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">Lisensi Aktif</p>
          <p className="mt-1.5 text-xl font-extrabold text-slate-900">{activeLicensesLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">Utilisasi Perangkat</p>
          <p className="mt-1.5 text-xl font-extrabold text-indigo-600">{utilizationLabel}</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">Waktu Respons</p>
          <p
            className={clsx(
              "mt-1.5 text-xl font-extrabold",
              isOnline ? "text-emerald-600" : "text-amber-600",
            )}
          >
            {latencyLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}
