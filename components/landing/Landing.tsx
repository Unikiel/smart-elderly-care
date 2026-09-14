"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FrontSurvey } from "@/lib/store";
import { coverForSurvey, photos } from "@/lib/photos";
import { surveyHeading, surveyInvite, surveyTag } from "@/lib/i18n";
import type { StoriesPack } from "@/lib/stories";
import { LanguageSwitch } from "@/components/i18n/LanguageSwitch";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { FlyPhoto } from "./FlyPhoto";
import { MixLockup } from "./MixLockup";
import { Reveal } from "./Reveal";
import { Stories } from "./Stories";

export function Landing({ surveys, stories }: { surveys: FrontSurvey[]; stories: StoriesPack }) {
  const { locale, t } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const chapter = locale === "en" && stories.en.feelings.length ? stories.en : stories.zh;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="overflow-x-hidden bg-[#fff3d6] text-[#3a2718]">
      <nav
        className={`sticky top-0 z-30 flex items-center justify-between px-5 py-5 md:px-12 ${
          scrolled ? "bg-[#fff3d6]/88 shadow-[0_10px_40px_rgba(58,39,24,0.08)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <Link href="/" className="font-script text-[26px] leading-none">
          {t.brand}
        </Link>
        <div className="flex items-center gap-4 text-[15px] text-[#8b5a32] md:gap-5">
          <a href="#surveys" className="hidden hover:text-[#3a2718] sm:inline">
            {t.navTalk}
          </a>
          <Link href="/login" className="hover:text-[#3a2718]">
            {t.navStaff}
          </Link>
          <LanguageSwitch tone="warm" />
        </div>
      </nav>

      <header className="grid min-h-[calc(100dvh-72px)] items-stretch md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col justify-center bg-[linear-gradient(165deg,#fff7e4_0%,#ffd39a_58%,#f4a36a_100%)] px-5 py-12 md:px-12 lg:px-16">
          <Reveal eager delay={0}>
            <p className="font-script text-[28px] leading-none text-[#c67a1a] md:text-[34px]">{t.heroKicker}</p>
          </Reveal>
          <Reveal eager delay={120}>
            <div className="mt-5">
              <MixLockup script={t.heroLines[0]} formal={t.heroLines[1]} />
            </div>
          </Reveal>
          <Reveal eager delay={240}>
            <p className="mt-6 max-w-md text-[18px] leading-8 text-[#6b3f1f]">{t.heroLead}</p>
          </Reveal>
          <Reveal eager delay={380}>
            <a
              href="#surveys"
              className="mt-10 inline-flex h-14 w-fit items-center gap-3 rounded-full bg-[#3a2718] px-6 text-[17px] text-[#fff3d6] transition-transform duration-500 hover:-translate-y-0.5"
            >
              {t.heroCta}
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f0b429] text-[#3a2718]">↓</span>
            </a>
          </Reveal>
        </div>
        <div className="relative min-h-[48vh] overflow-hidden md:min-h-full">
          <FlyPhoto src={photos.hero} from="right" eager position="58% 32%" className="absolute inset-0 h-full w-full" />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(244,163,106,0.38)_0%,rgba(244,163,106,0.12)_22%,transparent_48%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(58,39,24,0.12)_0%,transparent_28%,transparent_62%,rgba(58,39,24,0.28)_100%)]"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-5 border border-[#fff3d6]/55 md:inset-7" aria-hidden="true" />
        </div>
      </header>

      <Stories content={chapter} />

      <section id="surveys" className="scroll-mt-16 border-t border-[#e0a35a]/35">
        <div className="mx-auto max-w-[1280px] px-5 pb-6 pt-16 md:px-12">
          <Reveal>
            <p className="font-script text-[28px] leading-none text-[#c67a1a] md:text-[34px]">{t.surveysKicker}</p>
            <div className="mt-4">
              <MixLockup script={t.surveysLines[0]} formal={t.surveysLines[1]} as="h2" />
            </div>
          </Reveal>
        </div>

        {surveys.length === 0 ? (
          <p className="px-5 pb-24 text-[18px] text-[#8b5a32] md:px-12">{t.surveysEmpty}</p>
        ) : (
          surveys.map((survey, index) => {
            const flip = index % 2 === 1;
            return (
              <article
                key={survey.id}
                className="mx-auto grid max-w-[1280px] items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-12 md:py-20"
              >
                <div className={`relative aspect-[4/3] overflow-hidden ${flip ? "md:order-2" : ""}`}>
                  <FlyPhoto
                    src={coverForSurvey(survey.title, index)}
                    from={flip ? "right" : "left"}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <Reveal variant={flip ? "left" : "right"} delay={180} className={flip ? "md:order-1" : ""}>
                  <p className="font-script text-[26px] leading-none text-[#c67a1a]">{surveyTag(survey.title, locale)}</p>
                  <h3 className="mt-4 max-w-lg font-display text-3xl font-bold leading-snug md:text-5xl">
                    {surveyHeading(survey.title, locale)}
                  </h3>
                  <p className="mt-5 max-w-lg text-[18px] leading-8 text-[#8b5a32]">{surveyInvite(survey.title, locale)}</p>
                  <Link
                    href={`/s/${survey.token}`}
                    className="mt-10 inline-flex h-14 w-full max-w-sm items-center justify-between rounded-full bg-[#3a2718] px-5 text-[18px] text-[#fff3d6] transition-transform duration-500 hover:-translate-y-0.5"
                  >
                    {t.start}
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f0b429] text-[#3a2718]">→</span>
                  </Link>
                </Reveal>
              </article>
            );
          })
        )}
      </section>

      <footer className="border-t border-[#e0a35a]/35">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-12 text-[15px] text-[#8b5a32] md:flex-row md:items-center md:justify-between md:px-12">
          <p>{t.footer}</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-[#3a2718]">
              {t.navStaff}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
