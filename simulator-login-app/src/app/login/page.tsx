"use client";

import { AuthShell } from "../../components/AuthShell";
import { authClient } from "../../services/auth/authClient";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("demo.user");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authClient.startLogin({ username, password });
      sessionStorage.setItem("sim:user", username);

      if (result.skipOtp && result.directToken) {
        sessionStorage.setItem("sim:token", result.directToken);
        router.push("/result?status=success");
        return;
      }

      sessionStorage.setItem("sim:demoOtp", result.demoOtp ?? "");
      sessionStorage.setItem("sim:challengeId", result.challengeId);
      sessionStorage.setItem("sim:expiresAt", String(result.expiresAt));
      router.push(`/otp?challengeId=${encodeURIComponent(result.challengeId)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Bước 1"
      title="Đăng nhập"
      subtitle="Đăng nhập để trải nghiệm tính năng xác thực OTP"
    >
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Đang xử lý…" : "Tiếp tục"}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </AuthShell>
  );
}
