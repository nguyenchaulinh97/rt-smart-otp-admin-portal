"use client";

import { useApiQuery } from "@/services/api";
import { normalizeToken } from "@/services/http";

export type AdminProfile = {
  username?: string;
  user?: string;
  admin_id?: string | number;
  id?: string | number;
};

export function useProfile() {
  const token = (() => {
    if (!globalThis.window) return undefined;
    return normalizeToken(globalThis.localStorage.getItem("auth:token"));
  })();
  const { data, isLoading, error, refetch } = useApiQuery<AdminProfile | null>(
    ["admin-profile"],
    "/admin/profile",
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );

  return { data, isLoading, error, refetch };
}
