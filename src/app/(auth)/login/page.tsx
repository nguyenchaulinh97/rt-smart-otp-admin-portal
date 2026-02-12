"use client";

import { useI18n } from "@/hooks/useI18n";
import { Button, Checkbox, Input } from "antd";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const handleLogin = () => {
    localStorage.setItem("auth:loggedIn", "true");
    router.replace("/");
  };

  return (
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
            OTP
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("login.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("login.subtitle")}</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="email">
              {t("login.email")}
            </label>
            <Input id="email" type="email" placeholder="admin@company.com" className="mt-2" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600" htmlFor="password">
              {t("login.password")}
            </label>
            <Input id="password" type="password" placeholder="••••••••" className="mt-2" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <Checkbox>{t("login.remember")}</Checkbox>
            <Button type="link" size="small">
              {t("login.forgot")}
            </Button>
          </div>
          <Button type="primary" onClick={handleLogin} className="w-full">
            {t("login.button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
