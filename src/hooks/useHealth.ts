"use client";

import { useApiQuery, useApiMutation } from "@/services/api";

export function useHealth() {
  const { data, isLoading, error } = useApiQuery<Record<string, string>>(["health"], "/health");
  const syncMutation = useApiMutation<null, null>("/health/sync", "POST");

  const triggerSync = async () => {
    await syncMutation.mutateAsync(null);
    return true;
  };

  return { data, isLoading, error, triggerSync, isSyncing: syncMutation.isPending };
}
