"use client";

import { useCallback, useState } from "react";
import type {
  CreateReleaseRequestDTO,
  ReleaseQueryDTO,
  UpdateLogQueryDTO,
} from "@/modules/releases/domain/dto/ReleaseRequestDTO";
import type {
  ReleaseItemResponseDTO,
  ReleaseListResponseDTO,
  ReleaseStatsResponseDTO,
  UpdateLogListResponseDTO,
} from "@/modules/releases/domain/dto/ReleaseResponseDTO";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

export const useReleaseApi = () => {
  const { loading, error, clearError, execute } = useApiExecutor();

  const [releases, setReleases] = useState<ReleaseListResponseDTO | null>(null);
  const [stats, setStats] = useState<ReleaseStatsResponseDTO | null>(null);
  const [logs, setLogs] = useState<UpdateLogListResponseDTO | null>(null);

  const fetchReleases = useCallback(
    (query?: ReleaseQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (query?.channel) search.set("channel", query.channel);
        if (query?.isActive !== undefined) search.set("isActive", String(query.isActive));
        if (query?.search) search.set("search", query.search);
        if (query?.page) search.set("page", String(query.page));
        if (query?.limit) search.set("limit", String(query.limit));

        const qs = search.toString();
        const url = `/api/v1/releases${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<ReleaseListResponseDTO>(url, { method: "GET" });
        const data = unwrapApiResponse(response);
        setReleases(data);
        return data;
      }),
    [execute],
  );

  const fetchStats = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<ReleaseStatsResponseDTO>("/api/v1/releases/stats", {
          method: "GET",
        });
        const data = unwrapApiResponse(response);
        setStats(data);
        return data;
      }),
    [execute],
  );

  const fetchLogs = useCallback(
    (query?: UpdateLogQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (query?.action) search.set("action", query.action);
        if (query?.channel) search.set("channel", query.channel);
        if (query?.page) search.set("page", String(query.page));
        if (query?.limit) search.set("limit", String(query.limit));

        const qs = search.toString();
        const url = `/api/v1/releases/logs${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<UpdateLogListResponseDTO>(url, { method: "GET" });
        const data = unwrapApiResponse(response);
        setLogs(data);
        return data;
      }),
    [execute],
  );

  const createRelease = useCallback(
    (payload: CreateReleaseRequestDTO | FormData) =>
      execute(async () => {
        let response: unknown;

        if (payload instanceof FormData) {
          const res = await fetch("/api/v1/releases", {
            method: "POST",
            body: payload,
          });
          response = await res.json();
          if (!res.ok) {
            const err = response as { message?: string };
            throw new Error(err.message ?? "Gagal mengunggah biner rilis");
          }
          return response as ReleaseItemResponseDTO;
        }

        response = await apiRequest<ReleaseItemResponseDTO>("/api/v1/releases", {
          method: "POST",
          payload,
        });
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const toggleRelease = useCallback(
    (id: string, isActive?: boolean) =>
      execute(async () => {
        const response = await apiRequest<{ success: boolean; isActive: boolean }>(
          `/api/v1/releases/${id}`,
          {
            method: "PATCH",
            payload: { isActive },
          },
        );
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  const deleteRelease = useCallback(
    (id: string) =>
      execute(async () => {
        const response = await apiRequest<{ success: boolean }>(`/api/v1/releases/${id}`, {
          method: "DELETE",
        });
        return unwrapApiResponse(response);
      }),
    [execute],
  );

  return {
    loading,
    error,
    clearError,
    releases,
    stats,
    logs,
    fetchReleases,
    fetchStats,
    fetchLogs,
    createRelease,
    toggleRelease,
    deleteRelease,
  };
};
