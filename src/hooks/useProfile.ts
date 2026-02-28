"use client";

import { useApiQuery } from "@/services/api";

export type AdminProfile = {
  username?: string;
  user?: string;
  admin_id?: string | number;
  id?: string | number;
};

export function useProfile() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth:token") : undefined;
  const { data, isLoading, error, refetch } = useApiQuery<AdminProfile | null>(
    ["admin-profile"],
    "/admin/profile",
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  return { data, isLoading, error, refetch };
}
