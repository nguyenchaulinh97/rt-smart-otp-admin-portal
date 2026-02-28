"use client";

import { useI18n } from "@/hooks/useI18n";
import {
  AppstoreOutlined,
  AuditOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HeartOutlined,
  MobileOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SwapOutlined,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SidebarProps = {
  plain?: boolean; // when true, render inner content without Layout.Sider wrapper (used inside Drawer)
  onNavigate?: () => void;
  // optional controlled collapse
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
};

const defaultItems = (t: (k: string) => string) => [
  { label: t("nav.dashboard"), href: "/", icon: <DashboardOutlined /> },
  { label: t("nav.users"), href: "/users", icon: <UserOutlined /> },
  { label: t("nav.apps"), href: "/apps", icon: <AppstoreOutlined /> },
  { label: t("nav.tokens"), href: "/tokens", icon: <QrcodeOutlined /> },
  { label: t("nav.transactions"), href: "/transactions", icon: <SwapOutlined /> },
  { label: t("nav.devices"), href: "/devices", icon: <MobileOutlined /> },
  { label: t("nav.policies"), href: "/policies", icon: <SafetyOutlined /> },
  { label: t("nav.verifications"), href: "/verifications", icon: <SafetyCertificateOutlined /> },
  { label: t("nav.health"), href: "/health", icon: <HeartOutlined /> },
  { label: t("nav.risk"), href: "/risk", icon: <AuditOutlined /> },
  { label: t("nav.auditAdvanced"), href: "/audit-advanced", icon: <AuditOutlined /> },
  { label: t("nav.logs"), href: "/logs", icon: <FileTextOutlined /> },
];

export default function Sidebar({
  plain,
  onNavigate,
  collapsed: collapsedProp,
  onCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  // support controlled collapsed prop; otherwise use internal state persisted to localStorage
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem("ui:sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "ui:sidebar-collapsed",
        (collapsedProp ?? internalCollapsed) ? "true" : "false",
      );
    } catch {
      // ignore
    }
  }, [internalCollapsed, collapsedProp]);

  const collapsed = typeof collapsedProp === "boolean" ? collapsedProp : internalCollapsed;
  const setCollapsed = (c: boolean) => {
    if (typeof onCollapse === "function") onCollapse(c);
    else setInternalCollapsed(c);
  };

  const navItems = defaultItems(t);

  const activeKey =
    navItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href),
    )?.href ?? "/";

  const onMenuClick = ({ key }: { key: string }) => {
    if (key === pathname) return; // same route
    router.push(key);
    onNavigate?.();
  };

  // Map to AntD Menu items
  const menuItems = navItems.map((i) => ({ key: i.href, icon: i.icon, label: i.label }));

  // Plain mode: used inside Drawer for mobile — render the same header+Menu as desktop (no extra outer framing)
  if (plain) {
    return (
      <div className="h-full bg-white">
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#E35561] text-sm font-semibold text-white">
              OTP
            </div>
            <Typography.Text strong className="text-sm">
              {t("app.title")}
            </Typography.Text>
          </div>
          <Button
            type="text"
            size="small"
            icon={<MenuOutlined />}
            onClick={() => onNavigate?.()}
            aria-label="Close menu"
          />
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          inlineCollapsed={false}
          items={menuItems}
          onClick={onMenuClick}
          style={{ paddingTop: 8 }}
        />
      </div>
    );
  }

  // Desktop / collapsed sider
  return (
    <Layout.Sider
      width={256}
      collapsible
      collapsed={collapsed}
      onCollapse={(c) => setCollapsed(c)}
      collapsedWidth={80}
      breakpoint="md"
      trigger={null}
      className="min-h-screen border-r border-slate-200 bg-white"
      theme="light"
    >
      <div className="flex h-16 items-center px-4 border-b border-slate-200">
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#E35561] text-sm font-semibold text-white">
            OTP
          </div>
          {!collapsed && (
            <Typography.Text strong className="text-sm">
              {t("app.title")}
            </Typography.Text>
          )}
        </div>
        {/* collapse control removed from Sider trigger; parent or header can call setCollapsed */}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        inlineCollapsed={collapsed}
        items={menuItems}
        onClick={onMenuClick}
        style={{ paddingTop: 8 }}
      />
    </Layout.Sider>
  );
}
