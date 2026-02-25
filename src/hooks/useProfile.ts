"use client";

import { useApiQuery } from "@/services/api";

export function useProfile() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth:token") : undefined;
  const { data, isLoading, error, refetch } = useApiQuery<Record<string, any>>(
    ["admin-profile"],
    "/admin/profile",
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  return { data, isLoading, error, refetch };
}
