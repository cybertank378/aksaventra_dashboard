"use client";

import { Activity, ArrowDownToLine, CheckCircle2, Layers } from "lucide-react";
import type React from "react";
import type { ReleaseStatsResponseDTO } from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import Card from "@/shared-ui/component/Card";
import Skeleton from "@/shared-ui/component/Skeleton";

interface ReleaseStatsCardsProps {
  stats: ReleaseStatsResponseDTO | null;
  loading: boolean;
}

export const ReleaseStatsCards: React.FC<ReleaseStatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: "Total Versi Rilis",
      value: stats?.totalReleases ?? 0,
      icon: Layers,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      description: "Seluruh biner yang terdaftar",
    },
    {
      title: "Rilis Aktif (Terkini)",
      value: stats?.activeReleases ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      description: "Siap didistribusikan ke klien",
    },
    {
      title: "Total Biner Diunduh",
      value: (stats?.totalDownloads ?? 0).toLocaleString("id-ID"),
      icon: ArrowDownToLine,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      description: "Akumulasi download auto-updater",
    },
    {
      title: "Pengecekan Hari Ini",
      value: (stats?.checksToday ?? 0).toLocaleString("id-ID"),
      icon: Activity,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      description: "Permintaan /api/v1/updater/version",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="p-5 border border-slate-200/90 shadow-sm rounded-2xl">
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
