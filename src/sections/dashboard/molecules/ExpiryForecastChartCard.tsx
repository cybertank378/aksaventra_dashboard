"use client";

import type React from "react";
import type { TimeSeriesChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import Card from "@/shared-ui/component/Card";
import { BarChart, type BarSeriesConfig } from "@/shared-ui/component/Chart/BarChart";
import { ChartLegend, type ChartLegendItem } from "@/shared-ui/component/Chart/ChartLegend";
import Skeleton from "@/shared-ui/component/Skeleton";

export interface ExpiryForecastChartCardProps {
  chartData?: TimeSeriesChartResponseDTO;
  loading?: boolean;
}

export function ExpiryForecastChartCard({
  chartData,
  loading = false,
}: ExpiryForecastChartCardProps): React.JSX.Element {
  if (loading) {
    return (
      <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs">
        <Skeleton className="w-1/2 h-5 mb-4" />
        <Skeleton className="w-full h-[220px] rounded-xl" />
      </Card>
    );
  }

  const seriesData = chartData?.series?.[0]?.points ?? [];
  const chartDataFormatted = seriesData.map((pt) => ({
    label: pt.label,
    expiring: pt.value,
  }));

  const seriesConfigs: BarSeriesConfig[] = [
    { key: "expiring", label: "Akan Kedaluwarsa", color: "#F59E0B" }, // amber-500
  ];

  const legendItems: ChartLegendItem[] = [
    {
      key: "expiring",
      label: "Akan Kedaluwarsa",
      color: "#F59E0B",
      total: chartData?.series?.[0]?.total ?? 0,
    },
  ];

  return (
    <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs h-full">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Proyeksi Kedaluwarsa</h3>
        <p className="mt-0.5 text-xs text-slate-500">Estimasi lisensi berakhir 6 bulan ke depan</p>
      </div>

      <div className="my-auto py-1">
        <BarChart data={chartDataFormatted} xAxisKey="label" series={seriesConfigs} height={200} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <ChartLegend items={legendItems} />
      </div>
    </Card>
  );
}

export default ExpiryForecastChartCard;
