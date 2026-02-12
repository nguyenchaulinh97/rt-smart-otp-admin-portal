"use client";

import { useI18n } from "@/hooks/useI18n";
import { useRole } from "@/hooks/useRole";
import { allRoles } from "@/lib/rbac";
import { Button, Select } from "antd";
import { useRouter } from "next/navigation";

export default function TopBar() {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const { role, setRole } = useRole();

  const handleLogout = () => {
    localStorage.removeItem("auth:loggedIn");
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div>
        <p className="text-sm font-semibold text-slate-900 !mb-0">{t("app.headerTitle")}</p>
        <p className="text-xs text-slate-500 !mb-0">{t("app.headerSubtitle")}</p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          {t("language.label")}
          <Select
            value={locale}
            onChange={(value) => setLocale(value as "en" | "vi")}
            options={[
              { label: t("language.en"), value: "en" },
              { label: t("language.vi"), value: "vi" },
            ]}
            size="small"
            style={{ width: 110 }}
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          {t("app.role")}
          <Select
            value={role}
            onChange={(value) => setRole(value)}
            options={allRoles.map((value) => ({ label: t(`roles.${value}`), value }))}
            size="small"
            style={{ width: 120 }}
          />
        </label>
        <Button type="default" onClick={handleLogout}>
          {t("app.logout")}
        </Button>
      </div>
    </header>
  );
}
