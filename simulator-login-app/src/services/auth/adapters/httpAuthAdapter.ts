import { mapLoginResponseToLoginResult } from "@/services/auth/mapLoginResponse";
import type {
  AuthAdapter,
  LoginPayload,
  LoginResult,
  ResendPayload,
  ResendResult,
  VerifyPayload,
  VerifyResult,
} from "@/services/auth/types";

const getBase = () => process.env.NEXT_PUBLIC_AUTH_API_BASE_URL?.trim() ?? "";

const toUrl = (path: string) => {
  const base = getBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base.replace(/\/$/, "")}${normalized}`;
};

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(text.slice(0, 200) || "Phản hồi không phải JSON");
  }
};

const httpRequestJson = async <T>(
  path: string,
  payload: unknown,
  options?: { contentType?: string },
): Promise<T> => {
  const contentType = options?.contentType ?? "application/json";
  const body =
    contentType === "text/plain" ? JSON.stringify(payload) : JSON.stringify(payload);

  const response = await fetch(toUrl(path), {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });

  const data = await parseJson(response);
  const rec = data !== null && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const msg =
    rec && typeof rec.message === "string"
      ? rec.message
      : typeof rec?.error === "string"
        ? rec.error
        : "API request failed";

  if (!response.ok) {
    throw new Error(msg);
  }
  return data as T;
};

export const httpAuthAdapter: AuthAdapter = {
  startLogin(payload: LoginPayload): Promise<LoginResult> {
    const loginPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? "/api/proxy/auth/login";
    /** Client → Next proxy dùng JSON; proxy → upstream chuyển sang text/plain */
    const contentType =
      process.env.NEXT_PUBLIC_AUTH_LOGIN_CONTENT_TYPE?.trim() || "application/json";

    return (async () => {
      const raw = await httpRequestJson<unknown>(loginPath, payload, { contentType });
      return mapLoginResponseToLoginResult(raw);
    })();
  },
  verifyOtp(payload: VerifyPayload): Promise<VerifyResult> {
    return httpRequestJson<VerifyResult>(
      process.env.NEXT_PUBLIC_AUTH_VERIFY_PATH ?? "/api/mock/auth/verify",
      payload,
      { contentType: "application/json" },
    );
  },
  resendOtp(payload: ResendPayload): Promise<ResendResult> {
    return httpRequestJson<ResendResult>(
      process.env.NEXT_PUBLIC_AUTH_RESEND_PATH ?? "/api/mock/auth/resend",
      payload,
      { contentType: "application/json" },
    );
  },
};
