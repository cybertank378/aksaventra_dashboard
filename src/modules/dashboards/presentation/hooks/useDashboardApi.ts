"use client";

import { useCallback } from "react";
import type {
  ActivitiesQueryDTO,
  ChartRangeQueryDTO,
  RecentLicensesQueryDTO,
} from "@/modules/dashboards/domain/dto/DashboardRequestDTO";
import type {
  DashboardActivityDTO,
  DashboardSummaryResponseDTO,
  DistributionChartResponseDTO,
  RecentLicensesResponseDTO,
  TimeSeriesChartResponseDTO,
} from "@/modules/dashboards/domain/dto/DashboardResponseDTO";
import type { ValidationTrendSeriesKey } from "@/modules/dashboards/domain/types/ValidationTrendSeriesKey";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

export const useDashboardApi = () => {
  const { loading, error, clearError, execute } = useApiExecutor();

  const getSummary = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<DashboardSummaryResponseDTO>(
          "/api/v1/dashboard/summary",
          {
            method: "GET",
          },
        );
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const getRecentLicenses = useCallback(
    (params?: RecentLicensesQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (params?.status && params.status !== "ALL") search.set("status", params.status);
        if (params?.page) search.set("page", String(params.page));
        if (params?.limit) search.set("limit", String(params.limit));

        const qs = search.toString();
        const url = `/api/v1/dashboard/licenses/recent${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<RecentLicensesResponseDTO>(url, {
          method: "GET",
        });
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const getActivities = useCallback(
    (params?: ActivitiesQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (params?.limit) search.set("limit", String(params.limit));

        const qs = search.toString();
        const url = `/api/v1/dashboard/activities${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<DashboardActivityDTO[]>(url, {
          method: "GET",
        });
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const getValidationTrend = useCallback(
    (params?: ChartRangeQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (params?.range) search.set("range", params.range);

        const qs = search.toString();
        const url = `/api/v1/dashboard/charts/validation-trend${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<TimeSeriesChartResponseDTO<ValidationTrendSeriesKey>>(
          url,
          {
            method: "GET",
          },
        );
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const getLicenseStatusDistribution = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<DistributionChartResponseDTO>(
          "/api/v1/dashboard/charts/license-status",
          {
            method: "GET",
          },
        );
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const getIssuanceTrend = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<TimeSeriesChartResponseDTO>(
          "/api/v1/dashboard/charts/issuance-trend",
          {
            method: "GET",
          },
        );
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const getExpiryForecast = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<TimeSeriesChartResponseDTO>(
          "/api/v1/dashboard/charts/expiry-forecast",
          {
            method: "GET",
          },
        );
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  return {
    loading,
    error,
    clearError,
    getSummary,
    getRecentLicenses,
    getActivities,
    getValidationTrend,
    getLicenseStatusDistribution,
    getIssuanceTrend,
    getExpiryForecast,
  };
};
