"use client";

import { useCallback, useState } from "react";
import type {
  CreateUserDTO,
  ListUsersQueryDTO,
  UpdateUserDTO,
  UpdateUserStatusDTO,
} from "@/modules/users/domain/dto/UserRequestDTO";
import type {
  UserAdminItemDTO,
  UserDetailResponseDTO,
  UserListResponseDTO,
  UserMutationResponseDTO,
  UserStatsResponseDTO,
} from "@/modules/users/domain/dto/UserResponseDTO";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

/* ============================================================
 * USE USER API
 * ============================================================
 */

export const useUserApi = () => {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [usersData, setUsersData] = useState<UserListResponseDTO | null>(null);
  const [statsData, setStatsData] = useState<UserStatsResponseDTO | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserDetailResponseDTO | null>(null);

  ////////////////////////////////////////////////////////////
  // API EXECUTOR
  ////////////////////////////////////////////////////////////

  const { loading, error, clearError, execute } = useApiExecutor();

  ////////////////////////////////////////////////////////////
  // FETCH USERS DIRECTORY
  ////////////////////////////////////////////////////////////

  const fetchUsers = useCallback(
    (params: ListUsersQueryDTO = {}) =>
      execute(async () => {
        const query = new URLSearchParams();
        if (params.page) query.set("page", params.page.toString());
        if (params.limit) query.set("limit", params.limit.toString());
        if (params.search) query.set("search", params.search);
        if (params.role && params.role !== "ALL") query.set("role", params.role);
        if (params.accountState && params.accountState !== "ALL") {
          query.set("accountState", params.accountState);
        }
        if (params.sortBy) query.set("sortBy", params.sortBy);
        if (params.sortOrder) query.set("sortOrder", params.sortOrder);

        const response = await apiRequest<UserListResponseDTO>(
          `/api/v1/users?${query.toString()}`,
          {
            method: "GET",
          },
        );

        const data = unwrapApiResponse(response);
        setUsersData(data);
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
        const response = await apiRequest<UserStatsResponseDTO>("/api/v1/users/stats", {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setStatsData(data);
        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // FETCH USER DETAIL
  ////////////////////////////////////////////////////////////

  const fetchUserDetail = useCallback(
    (id: string) =>
      execute(async () => {
        const response = await apiRequest<UserDetailResponseDTO>(`/api/v1/users/${id}`, {
          method: "GET",
        });

        const data = unwrapApiResponse(response);
        setSelectedUserDetail(data);
        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // CREATE USER
  ////////////////////////////////////////////////////////////

  const createUser = useCallback(
    (dto: CreateUserDTO) =>
      execute(async () => {
        const response = await apiRequest<UserAdminItemDTO>("/api/v1/users", {
          method: "POST",
          payload: dto,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // UPDATE USER
  ////////////////////////////////////////////////////////////

  const updateUser = useCallback(
    (id: string, dto: UpdateUserDTO) =>
      execute(async () => {
        const response = await apiRequest<UserAdminItemDTO>(`/api/v1/users/${id}`, {
          method: "PATCH",
          payload: dto,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // UPDATE USER STATUS (Activate, Deactivate, Unlock)
  ////////////////////////////////////////////////////////////

  const updateUserStatus = useCallback(
    (id: string, dto: UpdateUserStatusDTO) =>
      execute(async () => {
        const response = await apiRequest<UserAdminItemDTO>(`/api/v1/users/${id}/status`, {
          method: "PATCH",
          payload: dto,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // REVOKE ACTIVE SESSIONS
  ////////////////////////////////////////////////////////////

  const revokeUserSessions = useCallback(
    (userId: string) =>
      execute(async () => {
        const response = await apiRequest<UserMutationResponseDTO>(
          `/api/v1/users/${userId}/revoke-sessions`,
          {
            method: "POST",
          },
        );

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  return {
    // Data State
    usersData,
    statsData,
    selectedUserDetail,
    setSelectedUserDetail,

    // Execution State
    loading,
    error,
    clearError,

    // Operations
    fetchUsers,
    fetchStats,
    fetchUserDetail,
    createUser,
    updateUser,
    updateUserStatus,
    revokeUserSessions,
  };
};
