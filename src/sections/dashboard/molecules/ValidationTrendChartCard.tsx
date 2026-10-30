"use client";

import type React from "react";
import type { TimeSeriesChartResponseDTO } from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";
import { VALIDATION_SERIES_COLORS } from "@/modules/dashboards/presentation/helpers/dashboardViewMapper";
import { ChartRangeToggle } from "@/sections/dashboard/atomic/ChartRangeToggle";
import Card from "@/shared-ui/component/Card";
import { AreaChart, type AreaSeriesConfig } from "@/shared-ui/component/Chart/AreaChart";
import { ChartLegend, type ChartLegendItem } from "@/shared-ui/component/Chart/ChartLegend";
import Skeleton from "@/shared-ui/component/Skeleton";

export interface ValidationTrendChartCardProps {
  chartData?: TimeSeriesChartResponseDTO<ValidationTrendSeriesKey>;
  selectedRange: ChartRange;
  onRangeChange: (range: ChartRange) => void;
  loading?: boolean;
}

export function ValidationTrendChartCard({
  chartData,
  selectedRange,
  onRangeChange,
  loading = false,
}: ValidationTrendChartCardProps): React.JSX.Element {
  const handleRangeChange = (range: ChartRange) => {
    onRangeChange(range);
  };

  if (loading) {
    return (
      <Card className="flex flex-col justify-between border-slate-200/90 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-1/3 h-5" />
          <Skeleton className="w-24 h-8" />
        </div>
        <Skeleton className="w-full h-[280px] rounded-xl" />
      </Card>
    );
  }

  // Pivot time-series points to array of { label, activated, verified, mismatch, rejected }
  const pointsMap = new Map<string, Record<string, unknown>>();

  if (chartData?.series) {
    for (const s of chartData.series) {
      for (const pt of s.points) {
        if (!pointsMap.has(pt.bucket)) {
          pointsMap.set(pt.bucket, {
            bucket: pt.bucket,
            label: pt.label,
            activated: 0,
            verified: 0,
            mismatch: 0,
            rejected: 0,
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

  const seriesConfigs: AreaSeriesConfig[] = [
    { key: "verified", label: "Terverifikasi", color: VALIDATION_SERIES_COLORS.verified },
    { key: "activated", label: "Aktivasi Baru", color: VALIDATION_SERIES_COLORS.activated },
    { key: "mismatch", label: "Hardware Mismatch", color: VALIDATION_SERIES_COLORS.mismatch },
    { key: "rejected", label: "Ditolak", color: VALIDATION_SERIES_COLORS.rejected },
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
    <Card className="flex flex-col border-slate-200/90 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Tren Validasi Engine</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Aktivitas verifikasi dan autentikasi HWID dari mesin klien
          </p>
        </div>
        <ChartRangeToggle value={selectedRange} onChange={handleRangeChange} />
      </div>

      <div className="mb-4">
        <AreaChart
          data={pivotedData}
          xAxisKey="label"
          series={seriesConfigs}
          height={280}
          stacked
        />
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <ChartLegend items={legendItems} />
      </div>
    </Card>
  );
}

export default ValidationTrendChartCard;
