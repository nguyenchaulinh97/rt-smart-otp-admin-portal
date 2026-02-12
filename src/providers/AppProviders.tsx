"use client";

import LanguageProvider from "@/providers/LanguageProvider";
import { ConfigProvider } from "antd";

const SSI_PRIMARY = "#E35561";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      componentSize="middle"
      theme={{
        token: {
          colorPrimary: SSI_PRIMARY,
          colorInfo: SSI_PRIMARY,
          colorLink: SSI_PRIMARY,
          colorTextBase: "#0f172a",
          colorTextSecondary: "#64748b",
          colorBgLayout: "#f8fafc",
          colorBgContainer: "#ffffff",
          colorBorder: "#e2e8f0",
          borderRadius: 10,
          borderRadiusLG: 12,
          borderRadiusSM: 8,
          controlHeight: 36,
          controlHeightSM: 32,
          controlHeightLG: 40,
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
        },
        components: {},
      }}
    >
      <LanguageProvider>{children}</LanguageProvider>
    </ConfigProvider>
  );
}
