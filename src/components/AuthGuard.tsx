"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";

const PUBLIC_ROUTES = new Set(["/login"]);
const AUTH_EVENT = "auth:state-change";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const authState = useSyncExternalStore<boolean | null>(
    (callback) => {
      if (typeof window === "undefined") return () => undefined;
      const handler = () => callback();
      window.addEventListener("storage", handler);
      window.addEventListener(AUTH_EVENT, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(AUTH_EVENT, handler);
      };
    },
    () => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem("auth:loggedIn") === "true";
    },
    () => null,
  );

  useEffect(() => {
    if (PUBLIC_ROUTES.has(pathname)) return;
    if (authState === false) router.replace("/login");
  }, [authState, pathname, router]);

  if (PUBLIC_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  if (authState !== true) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        {t("auth.redirecting")}
      </div>
    );
  }

  return <>{children}</>;
}
