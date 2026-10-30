"use client";

import { useCallback, useState } from "react";
import type {
  CreateLicenseDTO,
  LicenseQueryDTO,
  UpdateLicenseStatusDTO,
  ValidateLicenseRequestDTO,
} from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type {
  LicenseAdminItemDTO,
  LicenseDetailResponseDTO,
  LicenseListResponseDTO,
  LicenseMutationResponseDTO,
  LicenseStatsResponseDTO,
  ValidateLicenseSuccessResponseDTO,
} from "@/modules/licenses/domain/dto/LicenseResponseDTO";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

/* ============================================================
 * USE LICENSE API
 * ============================================================
 */

export const useLicenseApi = () => {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [validatedLicense, setValidatedLicense] =
    useState<ValidateLicenseSuccessResponseDTO | null>(null);
  const [licensesData, setLicensesData] = useState<LicenseListResponseDTO | null>(null);
  const [statsData, setStatsData] = useState<LicenseStatsResponseDTO | null>(null);
  const [selectedLicenseDetail, setSelectedLicenseDetail] =
    useState<LicenseDetailResponseDTO | null>(null);

  ////////////////////////////////////////////////////////////
  // API EXECUTOR
  ////////////////////////////////////////////////////////////

  const { loading, error, clearError, execute } = useApiExecutor();

  ////////////////////////////////////////////////////////////
  // VALIDATE LICENSE (Client binary aksaventra_engine.exe)
  ////////////////////////////////////////////////////////////

  const validateLicense = useCallback(
    (payload: ValidateLicenseRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<ValidateLicenseSuccessResponseDTO>("/api/v1/validate", {
          method: "POST",
          payload,
        });

        const data = unwrapApiResponse(response);
        setValidatedLicense(data);
        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // FETCH LICENSES DIRECTORY
  ////////////////////////////////////////////////////////////

  const fetchLicenses = useCallback(
    (params: LicenseQueryDTO = {}) =>
      execute(async () => {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page.toString());
        if (params.limit) query.set("limit", params.limit.toString());
        if (params.search) query.set("search", params.search);
        if (params.status && params.status !== "ALL") query.set("status", params.status);
        if (params.binding && params.binding !== "ALL") query.set("binding", params.binding);
        if (params.expiringSoon) query.set("expiringSoon", "true");
        if (params.sortBy) query.set("sortBy", params.sortBy);
        if (params.sortOrder) query.set("sortOrder", params.sortOrder);

        const queryString = query.toString();
        const url = queryString ? `/api/v1/licenses?${queryString}` : "/api/v1/licenses";

        const response = await apiRequest<LicenseListResponseDTO>(url, {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setLicensesData(data);
        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // FETCH STATS
  ////////////////////////////////////////////////////////////

  const fetchStats = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<LicenseStatsResponseDTO>("/api/v1/licenses/stats", {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setStatsData(data);
        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // FETCH LICENSE DETAIL
  ////////////////////////////////////////////////////////////

  const fetchLicenseDetail = useCallback(
    (id: string) =>
      execute(async () => {
        const response = await apiRequest<LicenseDetailResponseDTO>(`/api/v1/licenses/${id}`, {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setSelectedLicenseDetail(data);
        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // CREATE LICENSE
  ////////////////////////////////////////////////////////////

  const createLicense = useCallback(
    (payload: CreateLicenseDTO) =>
      execute(async () => {
        const response = await apiRequest<LicenseAdminItemDTO>("/api/v1/licenses", {
          method: "POST",
          payload,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // RESET DEVICE HWID
  ////////////////////////////////////////////////////////////

  const resetDeviceHwid = useCallback(
    (id: string, reason?: string) =>
      execute(async () => {
        const response = await apiRequest<LicenseMutationResponseDTO>(
          `/api/v1/licenses/${id}/reset-hwid`,
          {
            method: "PATCH",
            payload: { reason },
          },
        );

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // UPDATE LICENSE STATUS / EXTEND
  ////////////////////////////////////////////////////////////

  const updateLicenseStatus = useCallback(
    (id: string, payload: UpdateLicenseStatusDTO) =>
      execute(async () => {
        const response = await apiRequest<LicenseMutationResponseDTO>(
          `/api/v1/licenses/${id}/status`,
          {
            method: "PATCH",
            payload,
          },
        );

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // RETURN
  ////////////////////////////////////////////////////////////

  return {
    //////////////////////////////////////////////////////////
    // STATE
    //////////////////////////////////////////////////////////

    validatedLicense,
    licensesData,
    statsData,
    selectedLicenseDetail,
    loading,
    error,

    //////////////////////////////////////////////////////////
    // HELPERS
    //////////////////////////////////////////////////////////

    clearError,
    setSelectedLicenseDetail,

    //////////////////////////////////////////////////////////
    // METHODS
    //////////////////////////////////////////////////////////

    validateLicense,
    fetchLicenses,
    fetchStats,
    fetchLicenseDetail,
    createLicense,
    resetDeviceHwid,
    updateLicenseStatus,
  };
};
