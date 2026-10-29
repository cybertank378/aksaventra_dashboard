"use client";

import { useCallback, useState } from "react";

export interface ApiExecutorState {
  loading: boolean;
  error: string | null;
  clearError: () => void;
  execute: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

export function useApiExecutor(): ApiExecutorState {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan pada sistem";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    clearError,
    execute,
  };
}
