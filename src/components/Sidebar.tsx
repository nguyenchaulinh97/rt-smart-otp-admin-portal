"use client";

import { useI18n } from "@/hooks/useI18n";
import { Layout, Menu, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { label: t("nav.dashboard"), href: "/" },
    { label: t("nav.users"), href: "/users" },
    { label: t("nav.apps"), href: "/apps" },
    { label: t("nav.tokens"), href: "/tokens" },
    { label: t("nav.transactions"), href: "/transactions" },
    { label: t("nav.devices"), href: "/devices" },
    { label: t("nav.logs"), href: "/logs" },
  ];

  const activeKey = navItems.find((item) => isActivePath(pathname, item.href))?.href ?? "/";

  return (
    <Layout.Sider
      width={256}
      className="min-h-screen border-r border-slate-200 !bg-white"
      theme="light"
    >
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex h-16 items-center border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#E35561] text-sm font-semibold text-white">
              OTP
            </div>
            <div>
              <Typography.Text className="text-sm font-semibold text-slate-900 !mb-0" strong>
                {t("app.title")}
              </Typography.Text>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            className="border-none px-2 py-4"
            items={navItems.map((item) => ({
              key: item.href,
              label: <Link href={item.href}>{item.label}</Link>,
            }))}
          />
        </div>
      </div>
    </Layout.Sider>
  );
}
