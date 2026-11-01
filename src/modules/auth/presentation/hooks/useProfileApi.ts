"use client";

import { useCallback, useState } from "react";
import type { UserProfileResponseDTO } from "@/modules/auth/domain/dto/ProfileDTO";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

export function useProfileApi() {
  const [profile, setProfile] = useState<UserProfileResponseDTO | null>(null);
  const { loading, error, clearError, execute } = useApiExecutor();

  const getProfile = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<UserProfileResponseDTO>("/api/v1/auth/profile", {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setProfile(data);
        return data;
      }),
    [execute],
  );

  const updateProfile = useCallback(
    (name: string) =>
      execute(async () => {
        const response = await apiRequest<{ id: string; name: string | null; email: string }>(
          "/api/v1/auth/profile",
          {
            method: "PATCH",
            payload: { name },
          },
        );

        const data = unwrapApiResponse(response);
        setProfile((prev) => (prev ? { ...prev, name: data.name } : null));
        return data;
      }),
    [execute],
  );

  const revokeSession = useCallback(
    (sessionId: string) =>
      execute(async () => {
        const response = await apiRequest<{ success: boolean; message: string }>(
          `/api/v1/auth/sessions/${sessionId}`,
          {
            method: "DELETE",
          },
        );

        const data = unwrapApiResponse(response);
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                sessions: prev.sessions.filter((s) => s.id !== sessionId),
              }
            : null,
        );
        return data;
      }),
    [execute],
  );

  const revokeAllOtherSessions = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<{ message: string }>("/api/v1/auth/logout-all", {
          method: "POST",
        });

        const data = unwrapApiResponse(response);
        // Refresh profile to reflect remaining sessions
        await getProfile();
        return data;
      }),
    [execute, getProfile],
  );

  return {
    profile,
    loading,
    error,
    clearError,
    getProfile,
    updateProfile,
    revokeSession,
    revokeAllOtherSessions,
  };
}
