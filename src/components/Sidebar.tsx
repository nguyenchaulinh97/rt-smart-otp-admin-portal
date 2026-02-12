"use client";

import { useI18n } from "@/hooks/useI18n";
import {
  AppstoreOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MobileOutlined,
  QrcodeOutlined,
  SwapOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("ui:sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ui:sidebar-collapsed", collapsed ? "true" : "false");
    } catch {
      // ignore
    }
  }, [collapsed]);

  const navItems = [
    { label: t("nav.dashboard"), href: "/", icon: <DashboardOutlined /> },
    { label: t("nav.users"), href: "/users", icon: <UserOutlined /> },
    { label: t("nav.apps"), href: "/apps", icon: <AppstoreOutlined /> },
    { label: t("nav.tokens"), href: "/tokens", icon: <QrcodeOutlined /> },
    { label: t("nav.transactions"), href: "/transactions", icon: <SwapOutlined /> },
    { label: t("nav.devices"), href: "/devices", icon: <MobileOutlined /> },
    { label: t("nav.logs"), href: "/logs", icon: <FileTextOutlined /> },
  ];

  const activeKey = navItems.find((item) => isActivePath(pathname, item.href))?.href ?? "/";

  return (
    <Layout.Sider
      width={256}
      collapsed={collapsed}
      collapsedWidth={80}
      className="min-h-screen border-r border-slate-200 bg-white!"
      theme="light"
    >
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex h-16 items-center border-b border-slate-200 bg-white px-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#E35561] text-sm font-semibold text-white">
              OTP
            </div>
            {!collapsed ? (
              <div>
                <Typography.Text className="text-sm font-semibold text-slate-900 mb-0!" strong>
                  {t("app.title")}
                </Typography.Text>
              </div>
            ) : null}
          </div>
          <div>
            <Button type="text" size="small" onClick={() => setCollapsed((s) => !s)}>
              {collapsed ? "›" : "‹"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            className="border-none px-2 py-4"
            inlineCollapsed={collapsed}
            items={navItems.map((item) => ({
              key: item.href,
              icon: item.icon,
              label: <Link href={item.href}>{item.label}</Link>,
            }))}
          />
        </div>
      </div>
    </Layout.Sider>
  );
}
