import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
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
});

export const metadata: Metadata = {
  title: "Care · Hear every act of care",
  description: "Surveys on intelligent elderly care — warm, steady, and easy to answer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} ${printEn.variable} ${handEn.variable} locale-en h-full antialiased`}>
      <body className="min-h-full bg-canvas text-ink font-sans">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
