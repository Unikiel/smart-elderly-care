"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { copy, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof copy)[Locale];
} | null>(null);

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale === "en" ? "en" : "zh-CN";
  document.documentElement.classList.remove("locale-zh", "locale-en");
  document.documentElement.classList.add(locale === "en" ? "locale-en" : "locale-zh");
  document.cookie = `sec_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  try {
    localStorage.setItem("sec_locale", locale);
  } catch {
    /* ignore */
  }
}

export function LocaleProvider({ initial, children }: { initial: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    const saved = window.localStorage.getItem("sec_locale");
    if (saved === "en" || saved === "zh") {
      setLocaleState(saved);
      applyLocale(saved);
    } else {
      applyLocale(initial);
    }
  }, [initial]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        setLocaleState(next);
        applyLocale(next);
      },
      t: copy[locale],
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale");
  return ctx;
}
