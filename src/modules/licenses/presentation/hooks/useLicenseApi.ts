"use client";

import { useCallback, useState } from "react";
import type { ValidateLicenseRequestDTO } from "@/modules/licenses/domain/dto/LicenseRequestDTO";
import type { ValidateLicenseSuccessResponseDTO } from "@/modules/licenses/domain/dto/LicenseResponseDTO";
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

  ////////////////////////////////////////////////////////////
  // API EXECUTOR
  ////////////////////////////////////////////////////////////

  const { loading, error, clearError, execute } = useApiExecutor();

  ////////////////////////////////////////////////////////////
  // VALIDATE LICENSE
  ////////////////////////////////////////////////////////////

  const validateLicense = useCallback(
    (payload: ValidateLicenseRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<ValidateLicenseSuccessResponseDTO>("/api/v1/validate", {
          method: "POST",
          payload,
        });

        const data = unwrapApiResponse(response);

        //////////////////////////////////////////////////////
        // SET VALIDATED LICENSE
        //////////////////////////////////////////////////////

        setValidatedLicense(data);

        return data;
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
    loading,
    error,

    //////////////////////////////////////////////////////////
    // HELPERS
    //////////////////////////////////////////////////////////

    clearError,

    //////////////////////////////////////////////////////////
    // METHODS
    //////////////////////////////////////////////////////////

    validateLicense,
  };
};
