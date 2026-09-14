import { cookies } from "next/headers";
import { copy, type Locale } from "./i18n";

export async function getCopy() {
  const jar = await cookies();
  const locale: Locale = jar.get("sec_locale")?.value === "en" ? "en" : "zh";
  return { locale, t: copy[locale] };
}
