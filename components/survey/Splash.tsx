"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { startInvite } from "@/lib/actions";
import { FullPhoto } from "@/components/media/FullPhoto";
import { coverForSurvey } from "@/lib/photos";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { surveyHeading, visitorError } from "@/lib/i18n";

export function Splash({
  token,
  title,
  requirePin,
}: {
  token: string;
  title: string;
  requirePin: boolean;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const { locale, t } = useLocale();
  const heading = surveyHeading(title, locale);

  return (
    <main className="min-h-dvh md:grid md:grid-cols-2">
      <div className="relative min-h-[46vh] md:min-h-dvh">
        <FullPhoto src={coverForSurvey(title, 0)} />
      </div>
      <section className="flex flex-col justify-center bg-canvas px-8 py-14 md:px-16">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/" className="min-h-10 text-[16px] font-medium text-muted hover:text-ink">
            ← {t.playerHome}
          </Link>
        </div>
        <p className="font-script text-[28px] leading-none text-mint-deep">{t.brand}</p>
        <h1 className="mt-4 max-w-md font-display text-3xl font-bold leading-snug md:text-5xl">{heading}</h1>
        <p className="mt-6 max-w-md text-[18px] leading-8 text-muted">{t.splashLead}</p>
        {requirePin ? (
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            placeholder={t.splashPin}
            className="mt-8 w-full max-w-sm rounded-full bg-white px-5 py-3 text-[18px]"
          />
        ) : null}
        {error ? <p className="mt-4 text-coral">{error}</p> : null}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const result = await startInvite(token, pin);
              if (result?.error) setError(visitorError(result.error, t));
            })
          }
          className="mt-10 flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-ink px-5 text-[18px] text-white"
        >
          {t.start}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink">→</span>
        </button>
      </section>
    </main>
  );
}
