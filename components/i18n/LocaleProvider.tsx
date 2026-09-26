"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { copy } from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: "en";
  setLocale: (locale: "en") => void;
  t: (typeof copy)["en"];
} | null>(null);

export function LocaleProvider({ children }: { initial?: "en"; children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.classList.remove("locale-zh");
    document.documentElement.classList.add("locale-en");
    document.cookie = "sec_locale=en; path=/; max-age=31536000; samesite=lax";
    try {
      localStorage.setItem("sec_locale", "en");
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      locale: "en" as const,
      setLocale: () => {},
      t: copy.en,
    }),
    [],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale");
  return ctx;
}
