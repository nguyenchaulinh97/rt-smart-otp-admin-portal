import type {
  AuthAdapter,
  LoginPayload,
  LoginResult,
  ResendPayload,
  ResendResult,
  VerifyPayload,
  VerifyResult,
} from "@/services/auth/types";

const jsonRequest = async <T>(url: string, body: unknown): Promise<T> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }
  return data;
};

export const mockAuthAdapter: AuthAdapter = {
  startLogin(payload: LoginPayload): Promise<LoginResult> {
    return jsonRequest<LoginResult>("/api/mock/auth/login", payload);
  },
  verifyOtp(payload: VerifyPayload): Promise<VerifyResult> {
    return jsonRequest<VerifyResult>("/api/mock/auth/verify", payload);
  },
  resendOtp(payload: ResendPayload): Promise<ResendResult> {
    return jsonRequest<ResendResult>("/api/mock/auth/resend", payload);
  },
};
