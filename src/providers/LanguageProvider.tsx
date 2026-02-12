"use client";

import en from "@/locales/en.json";
import vi from "@/locales/vi.json";
import { createContext, useMemo, useSyncExternalStore } from "react";

export type Locale = "en" | "vi";

type Dictionary = typeof en;
const dictionaries: Record<Locale, Dictionary> = { en, vi };

const LOCALE_EVENT = "admin:locale-change";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string) => string;
};

const getNestedValue = (obj: Record<string, unknown>, key: string) => {
  return key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object" && part in acc
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      obj,
    );
};

const resolveBrowserLocale = (): Locale => {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.toLowerCase();
  return lang.startsWith("vi") ? "vi" : "en";
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const getClientSnapshot = (): Locale => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("admin:locale");
    if (stored === "en" || stored === "vi") return stored;
    return resolveBrowserLocale();
  };

  const locale = useSyncExternalStore<Locale>(
    (callback) => {
      if (typeof window === "undefined") return () => undefined;
      const handler = () => callback();
      window.addEventListener("storage", handler);
      window.addEventListener(LOCALE_EVENT, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(LOCALE_EVENT, handler);
      };
    },
    getClientSnapshot,
    () => "en",
  );

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary: Dictionary = dictionaries[locale];
    const t = (key: string) => {
      const resolved = getNestedValue(dictionary as unknown as Record<string, unknown>, key);
      return typeof resolved === "string" ? resolved : key;
    };

    const setLocaleSafe = (next: Locale) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("admin:locale", next);
        window.dispatchEvent(new Event(LOCALE_EVENT));
      }
    };

    return { locale, setLocale: setLocaleSafe, t };
  }, [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
