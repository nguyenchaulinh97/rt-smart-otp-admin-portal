import { API_BASE } from "./endpoints";

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

export const request = async <T>(path: string, options?: RequestOptions): Promise<T> => {
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers ?? {}),
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth:token");
    if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const err = new Error(
      (data && (data.message || data.error)) ?? `Request failed: ${response.status}`,
    );
    (err as any).status = response.status;
    (err as any).data = data;
    throw err;
  }

  return data as T;
};
