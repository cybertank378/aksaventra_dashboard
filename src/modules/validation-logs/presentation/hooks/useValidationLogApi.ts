"use client";

import { useCallback, useState } from "react";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";
import type {
  ExportValidationLogsQueryDTO,
  ListValidationLogsQueryDTO,
} from "../../domain/dto/ValidationLogRequestDTO";
import type {
  ValidationLogDetailResponseDTO,
  ValidationLogListResponseDTO,
  ValidationLogStatsDTO,
} from "../../domain/dto/ValidationLogResponseDTO";

export const useValidationLogApi = () => {
  const { loading, error, clearError, execute } = useApiExecutor();

  const [logs, setLogs] = useState<ValidationLogListResponseDTO | null>(null);
  const [stats, setStats] = useState<ValidationLogStatsDTO | null>(null);
  const [activeDetail, setActiveDetail] = useState<ValidationLogDetailResponseDTO | null>(null);

  const fetchLogs = useCallback(
    (query?: ListValidationLogsQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (query?.page) search.set("page", String(query.page));
        if (query?.limit) search.set("limit", String(query.limit));
        if (query?.search) search.set("search", query.search);
        if (query?.group && query.group !== "ALL") search.set("group", query.group);
        if (query?.result) search.set("result", query.result);
        if (query?.engineVersion) search.set("engineVersion", query.engineVersion);
        if (query?.startDate) search.set("startDate", query.startDate);
        if (query?.endDate) search.set("endDate", query.endDate);

        const qs = search.toString();
        const url = `/api/v1/logs/validations${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<ValidationLogListResponseDTO>(url, { method: "GET" });
        const data = unwrapApiResponse(response);
        setLogs(data);
        return data;
      }),
    [execute],
  );

  const fetchStats = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<ValidationLogStatsDTO>("/api/v1/logs/validations/stats", {
          method: "GET",
        });
        const data = unwrapApiResponse(response);
        setStats(data);
        return data;
      }),
    [execute],
  );

  const fetchDetail = useCallback(
    (id: string) =>
      execute(async () => {
        const response = await apiRequest<ValidationLogDetailResponseDTO>(
          `/api/v1/logs/validations/${encodeURIComponent(id)}`,
          { method: "GET" },
        );
        const data = unwrapApiResponse(response);
        setActiveDetail(data);
        return data;
      }),
    [execute],
  );

  const exportLogs = useCallback(
    (query?: ExportValidationLogsQueryDTO) =>
      execute(async () => {
        const search = new URLSearchParams();
        if (query?.search) search.set("search", query.search);
        if (query?.group && query.group !== "ALL") search.set("group", query.group);
        if (query?.result) search.set("result", query.result);
        if (query?.engineVersion) search.set("engineVersion", query.engineVersion);
        if (query?.startDate) search.set("startDate", query.startDate);
        if (query?.endDate) search.set("endDate", query.endDate);
        if (query?.format) search.set("format", query.format);

        const qs = search.toString();
        const url = `/api/v1/logs/validations/export${qs ? `?${qs}` : ""}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Gagal mengunduh berkas laporan log validasi");
        }

        const blob = await res.blob();
        const contentDisposition = res.headers.get("content-disposition");
        let filename = `validation-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?([^";]+)"?/);
          if (match?.[1]) filename = match[1];
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        return true;
      }),
    [execute],
  );

  return {
    loading,
    error,
    clearError,
    logs,
    stats,
    activeDetail,
    fetchLogs,
    fetchStats,
    fetchDetail,
    exportLogs,
  };
};
