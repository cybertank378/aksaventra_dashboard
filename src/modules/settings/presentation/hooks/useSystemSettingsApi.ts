"use client";

import { useCallback, useEffect, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import type {
  PurgeLogsDTO,
  ResetCategoryDTO,
  UpdateSystemSettingsDTO,
} from "../../domain/dto/SystemSettingsRequestDTO";
import type {
  PurgeResultDTO,
  SystemSettingsResponseDTO,
} from "../../domain/dto/SystemSettingsResponseDTO";

export function useSystemSettingsApi() {
  const [settings, setSettings] = useState<SystemSettingsResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (): Promise<SystemSettingsResponseDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error ${res.status}`);
      }

      const data: SystemSettingsResponseDTO = await res.json();
      setSettings(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat pengaturan sistem.";
      setError(message);
      showErrorToast(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (dto: UpdateSystemSettingsDTO): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg =
          data.errors?.length > 0
            ? data.errors.join("; ")
            : data.message || `Gagal menyimpan pengaturan (HTTP ${res.status})`;
        throw new Error(errMsg);
      }

      setSettings(data);
      showSuccessToast("Pengaturan sistem berhasil diperbarui.");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui pengaturan.";
      setError(message);
      showErrorToast(message);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const resetCategory = useCallback(async (dto: ResetCategoryDTO): Promise<boolean> => {
    setIsResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/settings/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Gagal mereset pengaturan (HTTP ${res.status})`);
      }

      setSettings(data);
      showSuccessToast("Pengaturan kategori berhasil dikembalikan ke nilai default.");
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mereset pengaturan.";
      setError(message);
      showErrorToast(message);
      return false;
    } finally {
      setIsResetting(false);
    }
  }, []);

  const purgeExpiredLogs = useCallback(
    async (dto: PurgeLogsDTO): Promise<PurgeResultDTO | null> => {
      setIsPurging(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/settings/maintenance/purge-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dto),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || `Gagal membersihkan log (HTTP ${res.status})`);
        }

        showSuccessToast(
          `Pembersihan selesai: ${data.totalPurgedCount} log lama berhasil dihapus secara permanen.`,
        );
        return data as PurgeResultDTO;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal membersihkan log lama.";
        setError(message);
        showErrorToast(message);
        return null;
      } finally {
        setIsPurging(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    isUpdating,
    isResetting,
    isPurging,
    fetchSettings,
    updateSettings,
    resetCategory,
    purgeExpiredLogs,
  };
}
