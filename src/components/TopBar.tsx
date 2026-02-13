"use client";

import { useI18n } from "@/hooks/useI18n";
import { useRole } from "@/hooks/useRole";
import { useTheme } from "@/hooks/useTheme";
import { allRoles } from "@/lib/rbac";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import { usePathname, useRouter } from "next/navigation";

export default function TopBar() {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("auth:loggedIn");
    router.replace("/login");
  };

  const section = (() => {
    if (!pathname || pathname === "/") return "dashboard";
    const parts = pathname.split("/").filter(Boolean);
    return parts[0] || "dashboard";
  })();

  const headerTitle = t(`${section}.title`) || t("app.headerTitle");
  const headerSubtitle = t(`${section}.subtitle`) || t("app.headerSubtitle");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div>
        <p className="text-sm font-semibold text-slate-900 mb-0!">{headerTitle}</p>
        <p className="text-xs text-slate-500 mb-0!">{headerSubtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="text"
          size="small"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
        </Button>
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
