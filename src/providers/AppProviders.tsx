"use client";

import { useTheme } from "@/hooks/useTheme";
import LanguageProvider from "@/providers/LanguageProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import UiProvider from "@/providers/UiProvider";
import { queryClient } from "@/services/api";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme as antdTheme } from "antd";

const SSI_PRIMARY = "#E35561";

const ThemedConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const token = {
    colorPrimary: SSI_PRIMARY,
    colorInfo: SSI_PRIMARY,
    colorLink: SSI_PRIMARY,
    colorTextBase: isDark ? "#e2e8f0" : "#0f172a",
    colorTextSecondary: isDark ? "#94a3b8" : "#64748b",
    colorBgLayout: isDark ? "#0b1220" : "#f8fafc",
    colorBgContainer: isDark ? "#111827" : "#ffffff",
    colorBorder: isDark ? "#1f2937" : "#e2e8f0",
    borderRadius: 10,
    borderRadiusLG: 12,
    borderRadiusSM: 8,
    controlHeight: 36,
    controlHeightSM: 32,
    controlHeightLG: 40,
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
  };

  return (
    <ConfigProvider
      componentSize="middle"
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token,
        components: {},
      }}
    >
      <LanguageProvider>
        <UiProvider>{children}</UiProvider>
      </LanguageProvider>
    </ConfigProvider>
  );
};

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ThemedConfigProvider>{children}</ThemedConfigProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
