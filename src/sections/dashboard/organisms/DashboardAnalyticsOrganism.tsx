"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  DashboardActivityDTO,
  DistributionChartResponseDTO,
  TimeSeriesChartResponseDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ChartRange } from "@/modules/dashboards/domain/types/ChartRange";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";
import { useDashboardApi } from "@/modules/dashboards/presentation/hooks/useDashboardApi";
import { ExpiryForecastChartCard } from "@/sections/dashboard/molecules/ExpiryForecastChartCard";
import { IssuanceTrendChartCard } from "@/sections/dashboard/molecules/IssuanceTrendChartCard";
import { LicenseStatusDonutCard } from "@/sections/dashboard/molecules/LicenseStatusDonutCard";
import { RecentActivityList } from "@/sections/dashboard/molecules/RecentActivityList";
import { ValidationTrendChartCard } from "@/sections/dashboard/molecules/ValidationTrendChartCard";

export function DashboardAnalyticsOrganism(): React.JSX.Element {
  const {
    getValidationTrend,
    getActivities,
    getLicenseStatusDistribution,
    getIssuanceTrend,
    getExpiryForecast,
  } = useDashboardApi();

  const [selectedRange, setSelectedRange] = useState<ChartRange>("30d");

  // Chart data states
  const [trendData, setTrendData] = useState<
    TimeSeriesChartResponseDTO<ValidationTrendSeriesKey> | undefined
  >(undefined);
  const [trendLoading, setTrendLoading] = useState(true);

  const [activities, setActivities] = useState<DashboardActivityDTO[] | undefined>(undefined);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [distribution, setDistribution] = useState<DistributionChartResponseDTO | undefined>(
    undefined,
  );
  const [distributionLoading, setDistributionLoading] = useState(true);

  const [issuanceData, setIssuanceData] = useState<TimeSeriesChartResponseDTO | undefined>(
    undefined,
  );
  const [issuanceLoading, setIssuanceLoading] = useState(true);

  const [forecastData, setForecastData] = useState<TimeSeriesChartResponseDTO | undefined>(
    undefined,
  );
  const [forecastLoading, setForecastLoading] = useState(true);

  // Fetch validation trend when range changes
  const fetchValidationTrend = useCallback(
    async (range: ChartRange) => {
      setTrendLoading(true);
      try {
        const data = await getValidationTrend({ range });
        if (data) {
          setTrendData(data);
        }
      } catch {
        // Handled by api executor
      } finally {
        setTrendLoading(false);
      }
    },
    [getValidationTrend],
  );

  const handleRangeChange = (newRange: ChartRange) => {
    setSelectedRange(newRange);
    fetchValidationTrend(newRange);
  };

  // Initial load
  useEffect(() => {
    fetchValidationTrend(selectedRange);

    // Activities
    getActivities({ limit: 6 })
      .then((data) => {
        if (data) setActivities(data);
      })
      .finally(() => setActivitiesLoading(false));

    // Distribution
    getLicenseStatusDistribution()
      .then((data) => {
        if (data) setDistribution(data);
      })
      .finally(() => setDistributionLoading(false));

    // Issuance trend
    getIssuanceTrend()
      .then((data) => {
        if (data) setIssuanceData(data);
      })
      .finally(() => setIssuanceLoading(false));

    // Expiry forecast
    getExpiryForecast()
      .then((data) => {
        if (data) setForecastData(data);
      })
      .finally(() => setForecastLoading(false));
  }, [
    fetchValidationTrend,
    selectedRange,
    getActivities,
    getLicenseStatusDistribution,
    getIssuanceTrend,
    getExpiryForecast,
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* ROW 3: Chart A (8 cols) + Activities (4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ValidationTrendChartCard
            chartData={trendData}
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
            loading={trendLoading && !trendData}
          />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityList activities={activities} loading={activitiesLoading && !activities} />
        </div>
      </div>

      {/* ROW 4: Chart B (4 cols) + Chart C (4 cols) + Chart D (4 cols) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="w-full">
          <LicenseStatusDonutCard
            distribution={distribution}
            loading={distributionLoading && !distribution}
          />
        </div>
        <div className="w-full">
          <IssuanceTrendChartCard
            chartData={issuanceData}
            loading={issuanceLoading && !issuanceData}
          />
        </div>
        <div className="w-full">
          <ExpiryForecastChartCard
            chartData={forecastData}
            loading={forecastLoading && !forecastData}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardAnalyticsOrganism;
