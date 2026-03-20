"use client";

import { AuthShell } from "@/components/AuthShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function readSessionToken() {
  if (typeof globalThis.window === "undefined") return "";
  return globalThis.sessionStorage.getItem("sim:token") ?? "";
}

function ResultPageInner() {
  const params = useSearchParams();
  const status = params.get("status") ?? "failed";
  const success = status === "success";
  const token = useSyncExternalStore(noopSubscribe, readSessionToken, () => "");

  return (
    <AuthShell
      badge="Hoàn tất"
      title={success ? "Đăng nhập thành công" : "Đăng nhập thất bại"}
      subtitle={
        success
          ? "OTP đã được xác minh (mock). Token bên dưới chỉ để kiểm thử."
          : "Vui lòng thử lại hoặc kiểm tra mã OTP / thời hạn challenge."
      }
    >
      <p className={success ? "success" : "error"} style={{ marginTop: 0 }}>
        {success
          ? "Luồng Smart OTP (simulator) hoàn tất."
          : "Không thể xác minh OTP trong lần thử này."}
      </p>
      {success && token ? <div className="token-preview">{token}</div> : null}

      <div className="btn-row" style={{ marginTop: "1.25rem" }}>
        <Link href="/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
          Đăng nhập lại
        </Link>
      </div>
    </AuthShell>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <AuthShell badge="Hoàn tất" title="Kết quả" subtitle="Đang tải…">
          <p className="muted">Vui lòng chờ…</p>
        </AuthShell>
      }
    >
      <ResultPageInner />
    </Suspense>
  );
}
