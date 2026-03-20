import { mapLoginResponseToLoginResult } from "../../../services/auth/mapLoginResponse";
import type {
  AuthAdapter,
  LoginPayload,
  LoginResult,
  ResendPayload,
  ResendResult,
  VerifyPayload,
  VerifyResult,
} from "../../../services/auth/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Resolve base URL from env (empty string → relative paths). */
const getBase = (): string => process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim() ?? "";

/** Build full URL: if base is set → absolute, otherwise relative. */
const toUrl = (path: string): string => {
  const base = getBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base.replace(/\/$/, "")}${normalized}` : normalized;
};

/** Safely parse JSON from a Response; throws on non-JSON bodies. */
const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(text.slice(0, 200) || "Phản hồi không phải JSON");
  }
};

/** Generic POST helper that returns typed JSON. */
const httpPost = async <T>(
  path: string,
  payload: unknown,
  contentType = "application/json",
): Promise<T> => {
  const response = await fetch(toUrl(path), {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: JSON.stringify(payload),
  });

  const data = await parseJson(response);

  if (!response.ok) {
    const rec =
      data !== null && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const msg =
      (rec && typeof rec.message === "string" && rec.message) ||
      (rec && typeof rec.error === "string" && rec.error) ||
      `API request failed (${String(response.status)})`;
    throw new Error(msg);
  }

  return data as T;
};

/* ------------------------------------------------------------------ */
/*  Adapter                                                            */
/* ------------------------------------------------------------------ */

export const httpAuthAdapter: AuthAdapter = {
  async startLogin(payload: LoginPayload): Promise<LoginResult> {
    const loginPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH?.trim() || "/api/v1/auth/login";
    const contentType = process.env.NEXT_PUBLIC_AUTH_LOGIN_CONTENT_TYPE?.trim() || "text/plain";

    const raw = await httpPost<unknown>(loginPath, payload, contentType);
    return mapLoginResponseToLoginResult(raw);
  },

  verifyOtp(payload: VerifyPayload): Promise<VerifyResult> {
    const verifyPath = process.env.NEXT_PUBLIC_AUTH_VERIFY_PATH?.trim() || "/api/mock/auth/verify";
    return httpPost<VerifyResult>(verifyPath, payload);
  },

  resendOtp(payload: ResendPayload): Promise<ResendResult> {
    const resendPath = process.env.NEXT_PUBLIC_AUTH_RESEND_PATH?.trim() || "/api/mock/auth/resend";
    return httpPost<ResendResult>(resendPath, payload);
  },
};
