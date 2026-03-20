import type { LoginResult } from "@/services/auth/types";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const pickString = (obj: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
};

const pickNumber = (obj: Record<string, unknown>, keys: string[], fallback: number): number => {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.length > 0) {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return fallback;
};

/**
 * Map backend JSON (thật hoặc mock) sang LoginResult.
 * - Nếu có token → đăng nhập xong, bỏ bước OTP (skipOtp).
 * - Nếu có challenge/session cho OTP → vào màn nhập OTP.
 */
export function mapLoginResponseToLoginResult(json: unknown): LoginResult {
  let obj = asRecord(json);
  if (!obj) {
    throw new Error("Phản hồi đăng nhập không hợp lệ");
  }

  // Một số API bọc payload trong `data`
  const nested = asRecord(obj.data);
  if (nested) {
    obj = { ...obj, ...nested };
  }

  const errMsg = pickString(obj, ["message", "error", "detail", "msg"]);
  const code = obj.code;
  if (errMsg && (obj.success === false || code === "ERROR" || obj.status === "error")) {
    throw new Error(errMsg);
  }

  const token = pickString(obj, [
    "access_token",
    "accessToken",
    "token",
    "id_token",
    "idToken",
    "jwt",
    "bearerToken",
  ]);

  if (token) {
    return {
      challengeId: "",
      expiresAt: pickNumber(obj, ["expires_at", "expiresAt", "exp"], Date.now() + 3600_000),
      attemptsRemaining: 0,
      deliveryHint: "",
      skipOtp: true,
      directToken: token,
    };
  }

  const challengeId = pickString(obj, [
    "challengeId",
    "challenge_id",
    "otpChallengeId",
    "sessionId",
    "session_id",
    "request_id",
    "requestId",
  ]);

  if (challengeId) {
    const demoOtp = pickString(obj, ["demoOtp", "otp", "otp_code", "otpCode"]);
    return {
      challengeId,
      expiresAt: pickNumber(obj, ["expires_at", "expiresAt"], Date.now() + 120_000),
      attemptsRemaining: pickNumber(obj, ["attempts_remaining", "attemptsRemaining"], 3),
      deliveryHint: pickString(obj, ["delivery_hint", "deliveryHint"]) ?? "Smart OTP",
      demoOtp,
      skipOtp: false,
    };
  }

  if (errMsg) {
    throw new Error(errMsg);
  }

  throw new Error(
    "Không đọc được token hoặc challenge từ API. Kiểm tra cấu trúc JSON phản hồi đăng nhập.",
  );
}
