"use client";

import { useCallback, useState } from "react";
import type {
  SecurityAuditQueryParamsDTO,
  SecurityAuditResponseDTO,
} from "@/modules/auth/domain/dto/SecurityAuditDTO";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

export function useSecurityAuditApi() {
  const [auditData, setAuditData] = useState<SecurityAuditResponseDTO | null>(null);
  const { loading, error, clearError, execute } = useApiExecutor();

  const getAuditLogs = useCallback(
    (params: SecurityAuditQueryParamsDTO = {}) =>
      execute(async () => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.search) searchParams.set("search", params.search);
        if (params.tab) searchParams.set("tab", params.tab);

        const qs = searchParams.toString();
        const url = `/api/v1/security/audit-logs${qs ? `?${qs}` : ""}`;

        const response = await apiRequest<SecurityAuditResponseDTO>(url, {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setAuditData(data);
        return data;
      }),
    [execute],
  );

  return {
    auditData,
    loading,
    error,
    clearError,
    getAuditLogs,
  };
}
