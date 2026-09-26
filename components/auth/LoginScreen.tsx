"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { FullPhoto } from "@/components/media/FullPhoto";
import { photos } from "@/lib/photos";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { visitorError } from "@/lib/i18n";

export function LoginScreen({ next }: { next?: string }) {
  const { t } = useLocale();
  const [state, formAction] = useActionState(loginAction, { error: "" });
  return (
    <main className="theme-staff min-h-dvh md:grid md:grid-cols-2">
      <div className="relative hidden min-h-dvh md:block">
        <FullPhoto src={photos.hero} style={{ objectPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a2718]/75 to-transparent" />
        <div className="pointer-events-none absolute inset-6 border border-[#fff3d6]/40" aria-hidden="true" />
        <p className="absolute bottom-10 left-10 text-[#fff3d6]">
          <span className="font-script block text-4xl leading-none">{t.loginSide[0]}</span>
          <span className="mt-2 block font-display text-4xl font-bold">{t.loginSide[1]}</span>
        </p>
      </div>
      <div className="flex min-h-dvh flex-col justify-center px-6 py-12 sm:px-12">
        <p className="font-script text-[28px] leading-none text-[#b45309]">{t.loginKicker}</p>
        <h1 className="mt-2 font-display text-4xl font-bold">{t.loginTitle}</h1>
        <form action={formAction} className="mt-8 max-w-md space-y-4 rounded-[28px] bg-[#fff4de] p-6 shadow-[0_18px_40px_rgba(58,39,24,0.16)]">
          <input type="hidden" name="next" value={next || "/admin"} />
          <label className="block text-base font-medium">
            {t.loginAccount}
            <input
              name="login"
              type="text"
              autoComplete="username"
              defaultValue="admin"
              className="mt-2 w-full rounded-full bg-[#f0c27a] px-4 py-3 text-[18px]"
            />
          </label>
          <label className="block text-base font-medium">
            {t.loginPassword}
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              defaultValue="changeit"
              className="mt-2 w-full rounded-full bg-[#f0c27a] px-4 py-3 text-[18px]"
            />
          </label>
          {state?.error ? <p className="text-[16px] text-coral">{visitorError(state.error, t)}</p> : null}
          <button className="h-12 w-full rounded-full bg-[#3a2718] text-[18px] font-semibold text-[#fff3d6]">{t.loginEnter}</button>
          <p className="text-center text-base text-[#8b5a32]">{t.loginHint}</p>
        </form>
        <Link href="/" className="mt-6 font-semibold text-[#3a2718]">
          {t.loginBack}
        </Link>
      </div>
    </main>
  );
}
