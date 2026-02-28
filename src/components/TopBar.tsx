"use client";

import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { LogoutOutlined, MenuOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button, Select, Tooltip } from "antd";
import { usePathname, useRouter } from "next/navigation";

export default function TopBar({
  onOpenMobile,
  onToggleSidebar,
}: {
  onOpenMobile?: () => void;
  onToggleSidebar?: () => void;
}) {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Button type="text" icon={<MenuOutlined />} onClick={onOpenMobile} />
        </div>
        <div className="hidden md:flex">
          <Button type="text" size="small" icon={<MenuOutlined />} onClick={onToggleSidebar} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-0!">{headerTitle}</p>
          {/* <p className="text-xs text-slate-500 mb-0!">{headerSubtitle}</p> */}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <Tooltip title={locale === "en" ? "Change language" : "Đổi ngôn ngữ"}>
            <Select
              value={locale}
              onChange={(value) => setLocale(value as "en" | "vi")}
              options={[
                {
                  label: (
                    <span role="img" aria-label="English">
                      🇬🇧
                    </span>
                  ),
                  value: "en",
                },
                {
                  label: (
                    <span role="img" aria-label="Vietnamese">
                      🇻🇳
                    </span>
                  ),
                  value: "vi",
                },
              ]}
              size="small"
              style={{ width: 64 }}
            />
          </Tooltip>
        </label>
        <Tooltip title={locale === "en" ? "Change theme" : "Đổi theme"}>
          <Button
            type="text"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
          </Button>
        </Tooltip>
        <Tooltip title={locale === "en" ? "Sign Out" : "Đăng xuất"}>
          <Button
            type="text"
            onClick={handleLogout}
            aria-label={locale === "en" ? "Sign Out" : "Đăng xuất"}
          >
            <LogoutOutlined />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
}
