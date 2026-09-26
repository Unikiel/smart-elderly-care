import { cookies } from "next/headers";
import { copy } from "./i18n";

export async function getCopy() {
  await cookies();
  return { locale: "en" as const, t: copy.en };
}
