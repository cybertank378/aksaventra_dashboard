"use client";

import { useState } from "react";

export function useAuthApi() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("[useAuthApi] Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    logout,
    loading,
  };
}
