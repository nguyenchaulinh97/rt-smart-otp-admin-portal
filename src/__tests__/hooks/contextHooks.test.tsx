import { renderHook } from "@testing-library/react";
import { useConfirm } from "@/hooks/useConfirm";
import { useI18n } from "@/hooks/useI18n";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import type { ReactNode } from "react";
import { LanguageContext } from "@/providers/LanguageProvider";
import { ThemeContext } from "@/providers/ThemeProvider";
import { UiContext } from "@/providers/UiProvider";

describe("context hooks", () => {
  it("throws when useTheme is outside provider", () => {
    expect(() => renderHook(() => useTheme())).toThrow("useTheme must be used within ThemeProvider");
  });

  it("returns theme context value", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeContext.Provider
        value={{ theme: "light", setTheme: jest.fn(), toggleTheme: jest.fn() }}
      >
        {children}
      </ThemeContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("light");
  });

  it("throws when useI18n is outside provider", () => {
    expect(() => renderHook(() => useI18n())).toThrow("useI18n must be used within LanguageProvider");
  });

  it("returns i18n context value", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <LanguageContext.Provider
        value={{ locale: "en", setLocale: jest.fn(), t: (key: string) => key }}
      >
        {children}
      </LanguageContext.Provider>
    );

    const { result } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.locale).toBe("en");
    expect(result.current.t("abc")).toBe("abc");
  });

  it("throws when useConfirm and useToast are outside provider", () => {
    expect(() => renderHook(() => useConfirm())).toThrow("useConfirm must be used within UiProvider");
    expect(() => renderHook(() => useToast())).toThrow("useToast must be used within UiProvider");
  });

  it("returns confirm and toast handlers from ui context", () => {
    const confirm = jest.fn(async () => true);
    const toast = jest.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <UiContext.Provider value={{ confirm, toast }}>{children}</UiContext.Provider>
    );

    const confirmHook = renderHook(() => useConfirm(), { wrapper });
    const toastHook = renderHook(() => useToast(), { wrapper });

    expect(confirmHook.result.current).toBe(confirm);
    expect(toastHook.result.current).toBe(toast);
  });
});
