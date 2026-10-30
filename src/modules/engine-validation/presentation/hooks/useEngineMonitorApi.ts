"use client";

import { useCallback, useRef, useState } from "react";
import type {
  LiveFeedQueryDTO,
  PatchBinaryStatusDTO,
  VerifyChecksumRequestDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorRequestDTO";
import type {
  BinaryIntegrityItemDTO,
  EngineMonitorSummaryResponseDTO,
  LiveFeedListResponseDTO,
  PatchBinaryStatusResponseDTO,
  VerifyChecksumResponseDTO,
} from "@/modules/engine-validation/domain/dto/EngineMonitorResponseDTO";
import { DEFAULT_POLL_INTERVAL_MS } from "@/modules/engine-validation/shared/constants/engineMonitorConstants";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

export interface SimulationPayload {
  serial_key: string;
  hwid: string;
  engine_version: string;
}

export interface SimulationResponse {
  valid: boolean;
  message: string;
  data?: unknown;
  latencyMs: number;
}

export function useEngineMonitorApi() {
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pollIntervalMs, setPollIntervalMs] = useState(DEFAULT_POLL_INTERVAL_MS);

  const [summary, setSummary] = useState<EngineMonitorSummaryResponseDTO | null>(null);
  const [feedData, setFeedData] = useState<LiveFeedListResponseDTO | null>(null);
  const [integrityList, setIntegrityList] = useState<BinaryIntegrityItemDTO[]>([]);

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const getSummary = useCallback(async (): Promise<EngineMonitorSummaryResponseDTO | null> => {
    try {
      const res = await fetch("/api/v1/engine/monitor/summary", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: EngineMonitorSummaryResponseDTO = await res.json();
      setSummary(data);
      return data;
    } catch (err) {
      console.error("[useEngineMonitorApi.getSummary] error:", err);
      return null;
    }
  }, []);

  const getFeed = useCallback(
    async (query?: LiveFeedQueryDTO): Promise<LiveFeedListResponseDTO | null> => {
      try {
        const searchParams = new URLSearchParams();
        if (query?.page) searchParams.set("page", String(query.page));
        if (query?.limit) searchParams.set("limit", String(query.limit));
        if (query?.group) searchParams.set("group", query.group);
        if (query?.engineVersion) searchParams.set("engineVersion", query.engineVersion);
        if (query?.search) searchParams.set("search", query.search);

        const url = `/api/v1/engine/monitor/feed${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data: LiveFeedListResponseDTO = await res.json();
        setFeedData(data);
        return data;
      } catch (err) {
        console.error("[useEngineMonitorApi.getFeed] error:", err);
        return null;
      }
    },
    [],
  );

  const listIntegrity = useCallback(async (): Promise<BinaryIntegrityItemDTO[]> => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/engine/integrity", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data: BinaryIntegrityItemDTO[] = await res.json();
      setIntegrityList(data);
      return data;
    } catch (err) {
      console.error("[useEngineMonitorApi.listIntegrity] error:", err);
      showErrorToast("Gagal memuat registri integritas biner engine");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyChecksum = useCallback(
    async (payload: VerifyChecksumRequestDTO): Promise<VerifyChecksumResponseDTO | null> => {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/engine/integrity/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          showErrorToast(data.message || "Gagal memverifikasi checksum");
          return null;
        }

        return data as VerifyChecksumResponseDTO;
      } catch (err) {
        console.error("[useEngineMonitorApi.verifyChecksum] error:", err);
        showErrorToast("Terjadi kesalahan jaringan saat memverifikasi checksum");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const patchBinaryStatus = useCallback(
    async (dto: PatchBinaryStatusDTO): Promise<PatchBinaryStatusResponseDTO | null> => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/engine/integrity/${dto.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isActive: dto.isActive,
            reason: dto.reason,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          showErrorToast(data.message || "Gagal memperbarui status biner");
          return null;
        }

        showSuccessToast(
          `Status biner v${data.version} berhasil diubah menjadi ${
            data.isActive ? "AKTIF" : "DICABUT (REVOKED)"
          }.`,
        );

        // Refresh registry
        await listIntegrity();
        return data as PatchBinaryStatusResponseDTO;
      } catch (err) {
        console.error("[useEngineMonitorApi.patchBinaryStatus] error:", err);
        showErrorToast("Gagal memperbarui status biner engine");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [listIntegrity],
  );

  const simulateValidation = useCallback(
    async (payload: SimulationPayload): Promise<SimulationResponse> => {
      const start = performance.now();
      try {
        const res = await fetch("/api/v1/validate-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const latencyMs = Math.round(performance.now() - start);
        const data = await res.json().catch(() => ({}));

        return {
          valid: res.ok && (data.valid ?? true),
          message: data.message || (res.ok ? "Validasi Sukses" : "Validasi Ditolak"),
          data,
          latencyMs,
        };
      } catch (err) {
        const latencyMs = Math.round(performance.now() - start);
        return {
          valid: false,
          message: err instanceof Error ? err.message : "Network error",
          latencyMs,
        };
      }
    },
    [],
  );

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return {
    loading,
    isPaused,
    pollIntervalMs,
    summary,
    feedData,
    integrityList,
    setPollIntervalMs,
    togglePause,
    getSummary,
    getFeed,
    listIntegrity,
    verifyChecksum,
    patchBinaryStatus,
    simulateValidation,
  };
}
