"use client";

import { Spin } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

const PUBLIC_ROUTES = new Set(["/login"]);
const AUTH_EVENT = "auth:state-change";

export default function AuthGuard({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();

  const authState = useSyncExternalStore<boolean | null>(
    (callback) => {
      const win = globalThis.window;
      if (!win) return () => undefined;
      const handler = () => callback();
      win.addEventListener("storage", handler);
      win.addEventListener(AUTH_EVENT, handler);
      return () => {
        win.removeEventListener("storage", handler);
        win.removeEventListener(AUTH_EVENT, handler);
      };
    },
    () => {
      const win = globalThis.window;
      if (!win) return null;
      return win.localStorage.getItem("auth:loggedIn") === "true";
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
      <output className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Spin size="large" />
        </div>
      </output>
    );
  }

  return <>{children}</>;
}
