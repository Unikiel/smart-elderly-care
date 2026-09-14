import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import { Cormorant_Garamond, Noto_Sans_SC, Noto_Serif_SC, Plus_Jakarta_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const noto = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const printZh = Noto_Serif_SC({
  variable: "--font-print-zh",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const printEn = Cormorant_Garamond({
  variable: "--font-print-en",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const handEn = localFont({
  src: "./fonts/Quentin.otf",
  variable: "--font-hand-en",
  display: "block",
  weight: "400",
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0000-007F, U+00A0-00FF, U+2018-201E, U+2026" }],
});

const handZh = localFont({
  src: "./fonts/Muyao-Softbrush.ttf",
  variable: "--font-hand-zh",
  display: "swap",
  weight: "400",
  preload: false,
  fallback: ["cursive"],
});

export async function generateMetadata(): Promise<Metadata> {
  const jar = await cookies();
  const en = jar.get("sec_locale")?.value === "en";
  return {
    title: en ? "智养 · Hear every act of care" : "智养 · 听懂每一次照护",
    description: en
      ? "Surveys on intelligent elderly care — warm, steady, and easy to answer."
      : "高端 AI 智慧养老服务调研 — 温暖、安心、有希望的智能问卷",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const locale = jar.get("sec_locale")?.value === "en" ? "en" : "zh";
  return (
    <html
      lang={locale === "en" ? "en" : "zh-CN"}
      className={`${jakarta.variable} ${noto.variable} ${printZh.variable} ${printEn.variable} ${handEn.variable} ${handZh.variable} ${locale === "en" ? "locale-en" : "locale-zh"} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-ink font-sans">
        <LocaleProvider initial={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
