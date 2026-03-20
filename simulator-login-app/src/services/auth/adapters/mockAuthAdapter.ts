import type {
  AuthAdapter,
  LoginPayload,
  LoginResult,
  ResendPayload,
  ResendResult,
  VerifyPayload,
  VerifyResult,
} from "../../../services/auth/types";

const jsonPost = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? `Request failed (${String(response.status)})`);
  }
  return data;
};

export const mockAuthAdapter: AuthAdapter = {
  startLogin(payload: LoginPayload): Promise<LoginResult> {
    return jsonPost<LoginResult>("/api/mock/auth/login", payload);
  },
  verifyOtp(payload: VerifyPayload): Promise<VerifyResult> {
    return jsonPost<VerifyResult>("/api/mock/auth/verify", payload);
  },
  resendOtp(payload: ResendPayload): Promise<ResendResult> {
    return jsonPost<ResendResult>("/api/mock/auth/resend", payload);
  },
};
