import { useQuery, useMutation, QueryClient } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function buildUrl(path: string) {
  // if path already looks like a full URL, use it as-is
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const url = buildUrl(path);

  // merge headers and auto-attach auth if available (only in browser)
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  } as Record<string, string>;

  if (!headers.Authorization && typeof window !== "undefined") {
    const token = localStorage.getItem("auth:token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const err = new Error(
      (body && (body.message || body.error)) ?? `Request failed: ${res.status}`,
    );
    (err as any).status = res.status;
    (err as any).data = body;
    throw err;
  }

  return body as T;
}

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
