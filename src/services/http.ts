import { API_BASE } from "./endpoints";

const hasAbsoluteUrl = (path: string) => /^https?:\/\//i.test(path);

function buildUrl(path: string) {
  if (hasAbsoluteUrl(path)) return path;
  // `endpoints.*()` already prepends API_BASE, avoid doubling it.
  if (API_BASE && path.startsWith(API_BASE)) return path;
  return `${API_BASE}${path}`;
}

export const normalizeToken = (value: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  return trimmed;
};

const clearStoredToken = () => {
  if (!globalThis.window) return;
  try {
    globalThis.localStorage.removeItem("auth:token");
  } catch {
    // ignore
  }
};

const getStoredToken = () => {
  if (!globalThis.window) return null;
  try {
    const raw = globalThis.localStorage.getItem("auth:token");
    const token = normalizeToken(raw);
    if (!token && raw) clearStoredToken();
    return token;
  } catch {
    return null;
  }
};

const headersToRecord = (optionsHeaders?: HeadersInit): Record<string, string> => {
  const record: Record<string, string> = {};
  if (!optionsHeaders) return record;
  if (optionsHeaders instanceof Headers) {
    optionsHeaders.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(optionsHeaders)) {
    optionsHeaders.forEach(([key, value]) => {
      record[key] = String(value);
    });
    return record;
  }
  Object.entries(optionsHeaders).forEach(([key, value]) => {
    if (value !== undefined) record[key] = String(value);
  });
  return record;
};

const buildHeaders = (optionsHeaders?: HeadersInit) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...headersToRecord(optionsHeaders),
  };
  if (!headers.Authorization) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const extractErrorMessage = (data: unknown) => {
  if (!data || typeof data !== "object") return undefined;
  const maybe = data as { message?: unknown; error?: unknown };
  return maybe.message ?? maybe.error;
};

export const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const url = buildUrl(path);
  const headers = buildHeaders(options?.headers);

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const messageFromBody = extractErrorMessage(data);
    if (typeof messageFromBody !== "string" || !messageFromBody.trim()) {
      const err = new Error(`Request failed: ${response.status}`);
      (err as Error & { status?: number; data?: unknown }).status = response.status;
      (err as Error & { status?: number; data?: unknown }).data = data;
      throw err;
    }
    const err = new Error(messageFromBody);
    (err as Error & { status?: number; data?: unknown }).status = response.status;
    (err as Error & { status?: number; data?: unknown }).data = data;
    throw err;
  }

  return data as T;
};
