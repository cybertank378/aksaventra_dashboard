"use client";

import { CheckCircle2, Radio, ShieldAlert, Timer } from "lucide-react";
import type React from "react";
import type { ValidationLogStatsDTO } from "@/modules/validation-logs/domain/dto/ValidationLogResponseDTO";
import Card from "@/shared-ui/component/Card";
import Skeleton from "@/shared-ui/component/Skeleton";

interface Props {
  stats: ValidationLogStatsDTO | null;
  loading: boolean;
}

export const ValidationLogStatsGrid: React.FC<Props> = ({ stats, loading }) => {
  const cards = [
    {
      title: "Total Request (24J)",
      value: `${(stats?.totalRequests24h ?? 0).toLocaleString("id-ID")} req`,
      icon: Radio,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description: "Permintaan validasi 24 jam terakhir",
    },
    {
      title: "Rasio Validasi Sah",
      value: `${(stats?.successRatePercent ?? 100).toFixed(1)}%`,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      description: "Tingkat sukses otentikasi (200 OK)",
    },
    {
      title: "Pelanggaran HWID",
      value: `${(stats?.hwidMismatchCount24h ?? 0).toLocaleString("id-ID")} kasus`,
      icon: ShieldAlert,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      description: "Penolakan 403 Hardware Mismatch",
    },
    {
      title: "Rata-rata Latensi API",
      value: `${stats?.avgLatencyMs ?? 0} ms`,
      icon: Timer,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      description: "Target kelaikan SLA < 200 ms",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="p-5 border border-slate-200/90 shadow-xs rounded-2xl bg-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">{card.title}</span>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-8 w-24 rounded-lg" />
              ) : (
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {card.value}
                </div>
              )}
              <p className="mt-1 text-xs text-slate-400">{card.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
