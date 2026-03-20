"use client";

import { AuthShell } from "@/components/AuthShell";
import { OtpSixInputs } from "@/components/OtpSixInputs";
import { authClient } from "@/services/auth/authClient";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 15;

function OtpPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [challengeId, setChallengeId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [demoOtp, setDemoOtp] = useState("");

  /**
   * Một effect duy nhất: đọc query + sessionStorage đồng bộ rồi mới quyết định redirect.
   * Tránh race: effect khác thấy challengeId rỗng và replace('/login') trước khi state được hydrate.
   */
  useEffect(() => {
    const fromQuery = params.get("challengeId") ?? "";
    const fromStorage = sessionStorage.getItem("sim:challengeId") ?? "";
    const id = fromQuery || fromStorage;
    setChallengeId(id);
    setDemoOtp(sessionStorage.getItem("sim:demoOtp") ?? "");
    if (!id) {
      router.replace("/login");
    }
  }, [params, router]);

  useEffect(() => {
    if (!challengeId) return;
    const interval = setInterval(() => {
      setResendCountdown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [challengeId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challengeId || otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const result = await authClient.verifyOtp({ challengeId, otpCode });
      if (!result.success) {
        setError(result.message);
        return;
      }
      sessionStorage.setItem("sim:token", result.token ?? "");
      router.push("/result?status=success");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Xác thực OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (resendCountdown > 0 || !challengeId) return;
    setError("");
    setInfo("");
    try {
      const result = await authClient.resendOtp({ challengeId });
      sessionStorage.setItem("sim:demoOtp", result.demoOtp ?? "");
      sessionStorage.setItem("sim:expiresAt", String(result.expiresAt));
      setDemoOtp(result.demoOtp ?? "");
      setInfo("Đã tạo mã OTP mới.");
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Gửi lại thất bại");
    }
  };

  if (!challengeId) {
    return (
      <AuthShell badge="Bước 2" title="Smart OTP" subtitle="Đang tải phiên làm việc…">
        <p className="muted">Chuyển hướng nếu thiếu challenge…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Bước 2"
      title="Nhập Smart OTP"
      subtitle="Mã demo hiển thị bên dưới để QA không cần app thật. Khi có API, bỏ hiển thị này."
    >
      <div className="otp-demo">
        <span className="otp-demo__label">Mã thử (mock)</span>
        <span className="otp-demo__code">{demoOtp || "------"}</span>
      </div>

      <form onSubmit={onSubmit}>
        <p className="field-label">Mã xác thực 6 số</p>
        <OtpSixInputs value={otpCode} onChange={setOtpCode} disabled={loading} />

        <div className="btn-row">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Đang xác minh…" : "Xác nhận"}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onResend}
            disabled={resendCountdown > 0 || loading}
          >
            {resendCountdown > 0 ? `Gửi lại (${resendCountdown}s)` : "Gửi lại OTP"}
          </button>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {info ? <p className="success">{info}</p> : null}
      </form>

      <Link href="/login" className="link-back">
        ← Quay lại đăng nhập
      </Link>
    </AuthShell>
  );
}

export default function OtpPage() {
  return (
    <Suspense
      fallback={
        <AuthShell badge="Bước 2" title="Smart OTP" subtitle="Đang tải…">
          <p className="muted">Vui lòng chờ…</p>
        </AuthShell>
      }
    >
      <OtpPageInner />
    </Suspense>
  );
}
