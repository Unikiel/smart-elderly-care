"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";

export function LanguageSwitch({ tone = "plain" }: { tone?: "plain" | "warm" | "dark" }) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const base = tone === "warm" ? "text-[#8b5a32]" : tone === "dark" ? "text-[#c9a06a]" : "text-muted";
  const on = tone === "warm" ? "text-[#3a2718]" : tone === "dark" ? "text-[#fff3d6]" : "text-ink";
  const choose = (next: "zh" | "en") => {
    setLocale(next);
    router.refresh();
  };

  return (
    <div className={`flex items-center gap-1 text-[15px] tracking-[0.12em] ${base}`}>
      <button
        type="button"
        onClick={() => choose("zh")}
        className={`min-h-10 px-1 ${locale === "zh" ? on : ""}`}
      >
        中
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        onClick={() => choose("en")}
        className={`min-h-10 px-1 ${locale === "en" ? on : ""}`}
      >
        EN
      </button>
    </div>
  );
}
