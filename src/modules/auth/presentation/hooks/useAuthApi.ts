"use client";

import { useCallback, useState } from "react";
import type {
  ChangePasswordRequestDTO,
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  ResetPasswordRequestDTO,
  VerifyEmailRequestDTO,
} from "@/modules/auth/domain/dto/AuthRequestDTO";
import type {
  AuthTelemetryResponseDTO,
  AuthUserResponseDTO,
  ChangePasswordResponseDTO,
  ForgotPasswordResponseDTO,
  LoginResponseDTO,
  LogoutResponseDTO,
  RefreshTokenResponseDTO,
  RegisterResponseDTO,
  VerifyEmailResponseDTO,
} from "@/modules/auth/domain/dto/AuthResponseDTO";
import { apiRequest } from "@/shared/lib/api/apiRequest";
import { useApiExecutor } from "@/shared/lib/api/createApiExecutor";
import { unwrapApiResponse } from "@/shared/lib/api/unwrapApiResponse";

/* ============================================================
 * USE AUTH API
 * ============================================================
 */

export const useAuthApi = () => {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [userAuth, setUserAuth] = useState<AuthUserResponseDTO | null>(null);

  ////////////////////////////////////////////////////////////
  // API EXECUTOR
  ////////////////////////////////////////////////////////////

  const { loading, error, clearError, execute } = useApiExecutor();

  ////////////////////////////////////////////////////////////
  // REGISTER
  ////////////////////////////////////////////////////////////

  const register = useCallback(
    (payload: RegisterRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<RegisterResponseDTO>("/api/v1/auth/register", {
          method: "POST",
          payload,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // LOGIN
  ////////////////////////////////////////////////////////////

  const login = useCallback(
    (payload: LoginRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<LoginResponseDTO>("/api/v1/auth/login", {
          method: "POST",
          payload,
        });

        const data = unwrapApiResponse(response);

        //////////////////////////////////////////////////////
        // SET USER
        //////////////////////////////////////////////////////

        setUserAuth(data.user);

        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // REFRESH TOKEN
  ////////////////////////////////////////////////////////////

  const refreshToken = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<RefreshTokenResponseDTO>("/api/v1/auth/refresh-token", {
          method: "POST",
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // LOGOUT
  ////////////////////////////////////////////////////////////

  const logout = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<LogoutResponseDTO>("/api/v1/auth/logout", {
          method: "POST",
        });

        const data = unwrapApiResponse(response);

        //////////////////////////////////////////////////////
        // CLEAR USER
        //////////////////////////////////////////////////////

        setUserAuth(null);

        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // LOGOUT ALL
  ////////////////////////////////////////////////////////////

  const logoutAll = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<LogoutResponseDTO>("/api/v1/auth/logout-all", {
          method: "POST",
        });

        const data = unwrapApiResponse(response);

        //////////////////////////////////////////////////////
        // CLEAR USER
        //////////////////////////////////////////////////////

        setUserAuth(null);

        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // FORGOT PASSWORD
  ////////////////////////////////////////////////////////////

  const forgotPassword = useCallback(
    (payload: ForgotPasswordRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<ForgotPasswordResponseDTO>(
          "/api/v1/auth/forgot-password",
          {
            method: "POST",
            payload,
          },
        );

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // RESET PASSWORD
  ////////////////////////////////////////////////////////////

  const resetPassword = useCallback(
    (payload: ResetPasswordRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<LogoutResponseDTO>("/api/v1/auth/reset-password", {
          method: "POST",
          payload,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // CHANGE PASSWORD
  ////////////////////////////////////////////////////////////

  const changePassword = useCallback(
    (payload: ChangePasswordRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<ChangePasswordResponseDTO>(
          "/api/v1/auth/change-password",
          {
            method: "POST",
            payload,
          },
        );

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // VERIFY EMAIL
  ////////////////////////////////////////////////////////////

  const verifyEmail = useCallback(
    (payload: VerifyEmailRequestDTO) =>
      execute(async () => {
        const response = await apiRequest<VerifyEmailResponseDTO>("/api/v1/auth/verify-email", {
          method: "POST",
          payload,
        });

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // SEND VERIFICATION
  ////////////////////////////////////////////////////////////

  const sendVerification = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<VerifyEmailResponseDTO>(
          "/api/v1/auth/send-verification",
          {
            method: "POST",
          },
        );

        return unwrapApiResponse(response);
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // VALIDATE ACCESS TOKEN
  ////////////////////////////////////////////////////////////

  const validateAccessToken = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<AuthUserResponseDTO>(
          "/api/v1/auth/validate-access-token",
          {
            method: "GET",
          },
        );

        const data = unwrapApiResponse(response);

        //////////////////////////////////////////////////////
        // SET USER
        //////////////////////////////////////////////////////

        setUserAuth(data);

        return data;
      }),
    [execute],
  );

  ////////////////////////////////////////////////////////////
  // GET TELEMETRY
  ////////////////////////////////////////////////////////////

  const getTelemetry = useCallback(
    () =>
      execute(async () => {
        const response = await apiRequest<AuthTelemetryResponseDTO>("/api/v1/auth/telemetry", {
          method: "GET",
        });

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

    userAuth,
    loading,
    error,

    //////////////////////////////////////////////////////////
    // HELPERS
    //////////////////////////////////////////////////////////

    clearError,

    //////////////////////////////////////////////////////////
    // METHODS
    //////////////////////////////////////////////////////////

    register,
    login,
    refreshToken,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyEmail,
    sendVerification,
    validateAccessToken,
    getTelemetry,
  };
};
