"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export function StoriesAdminIntro() {
  const { t } = useLocale();
  return (
    <div>
      <h1 className="text-2xl font-extrabold">{t.storiesAdminTitle}</h1>
      <p className="mt-1 text-sm text-muted">{t.storiesAdminHelp}</p>
    </div>
  );
}
