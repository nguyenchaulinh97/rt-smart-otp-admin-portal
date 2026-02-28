import { API_BASE } from "./endpoints";

const hasAbsoluteUrl = (path: string) => /^https?:\/\//i.test(path);

function buildUrl(path: string) {
  if (hasAbsoluteUrl(path)) return path;
  // `endpoints.*()` already prepends API_BASE, avoid doubling it.
  if (API_BASE && path.startsWith(API_BASE)) return path;
  return `${API_BASE}${path}`;
}

export const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const url = buildUrl(path);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  } as Record<string, string>;

  if (!headers.Authorization && typeof window !== "undefined") {
    const token = localStorage.getItem("auth:token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const messageFromBody =
      data && typeof data === "object"
        ? (data as { message?: unknown; error?: unknown }).message ??
          (data as { message?: unknown; error?: unknown }).error
        : undefined;
    const err = new Error(
      typeof messageFromBody === "string" && messageFromBody.trim()
        ? messageFromBody
        : `Request failed: ${response.status}`,
    );
    (err as Error & { status?: number; data?: unknown }).status = response.status;
    (err as Error & { status?: number; data?: unknown }).data = data;
    throw err;
  }

  return data as T;
};
