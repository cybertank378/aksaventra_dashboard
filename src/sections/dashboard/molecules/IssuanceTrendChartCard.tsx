"use client";

import type React from "react";
import type { TimeSeriesChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import Card from "@/shared-ui/component/Card";
import { BarChart, type BarSeriesConfig } from "@/shared-ui/component/Chart/BarChart";
import { ChartLegend, type ChartLegendItem } from "@/shared-ui/component/Chart/ChartLegend";
import Skeleton from "@/shared-ui/component/Skeleton";

export interface IssuanceTrendChartCardProps {
  chartData?: TimeSeriesChartResponseDTO;
  loading?: boolean;
}

export function IssuanceTrendChartCard({
  chartData,
  loading = false,
}: IssuanceTrendChartCardProps): React.JSX.Element {
  if (loading) {
    return (
      <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs">
        <Skeleton className="w-1/2 h-5 mb-4" />
        <Skeleton className="w-full h-[220px] rounded-xl" />
      </Card>
    );
  }

  // Pivot data: array of { label, issued, activated }
  const pointsMap = new Map<string, Record<string, unknown>>();

  if (chartData?.series) {
    for (const s of chartData.series) {
      for (const pt of s.points) {
        if (!pointsMap.has(pt.bucket)) {
          pointsMap.set(pt.bucket, {
            bucket: pt.bucket,
            label: pt.label,
            issued: 0,
            activated: 0,
          });
        }
        const entry = pointsMap.get(pt.bucket);
        if (entry) {
          entry[s.key] = pt.value;
        }
      }
    }
  }

  const pivotedData = Array.from(pointsMap.values());

  const seriesConfigs: BarSeriesConfig[] = [
    { key: "issued", label: "Diterbitkan", color: "#2563EB" }, // blue-600
    { key: "activated", label: "Diaktivasi", color: "#10B981" }, // emerald-500
  ];

  const legendItems: ChartLegendItem[] = seriesConfigs.map((s) => {
    const target = chartData?.series.find((cs) => cs.key === s.key);
    return {
      key: s.key,
      label: s.label,
      color: s.color,
      total: target?.total ?? 0,
    };
  });

  return (
    <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Tren Penerbitan & Aktivasi</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Aktivitas penerbitan lisensi 6 bulan terakhir
        </p>
      </div>

      <div className="my-auto py-1">
        <BarChart data={pivotedData} xAxisKey="label" series={seriesConfigs} height={200} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <ChartLegend items={legendItems} />
      </div>
    </Card>
  );
}

export default IssuanceTrendChartCard;
