import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";
import { request } from "@/services/http";

export const apiFetch = request;

export function useApiQuery<T>(key: unknown[], path: string, options?: RequestInit) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => apiFetch<T>(path, options),
  });
}

export function useApiMutation<T, V = unknown>(
  path: string,
  method: "POST" | "PUT" | "DELETE" | "PATCH" = "POST",
) {
  return useMutation<T, unknown, V>({
    mutationFn: (body: V) =>
      apiFetch<T>(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      }),
  });
}

export const queryClient = new QueryClient();
