"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { FullPhoto } from "@/components/media/FullPhoto";
import { saveDraft, submitSurvey } from "@/lib/actions";
import { coverForSurvey } from "@/lib/photos";
import type { Answers, AssignmentRecord, QuestionnaireRecord } from "@/lib/survey-engine/types";
import { visitorError } from "@/lib/i18n";
import { localizeQuestionnaire } from "@/lib/survey-locale";
import { validateQuestion } from "@/lib/survey-engine/validate";
import { visibleQuestions } from "@/lib/survey-engine/visibility";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { QuestionWidget } from "./widgets";

type Props = {
  assignment: AssignmentRecord;
  questionnaire: QuestionnaireRecord;
  preview?: boolean;
};

const roleKeys = ["elder", "family", "staff", "other"] as const;

function Shell({
  side,
  children,
}: {
  side: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-2">
      <aside className="relative hidden overflow-hidden md:block">{side}</aside>
      <div className="bg-canvas">
        <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 py-10 sm:px-12">{children}</div>
      </div>
    </div>
  );
}

function HomeBar({ href = "/", extra }: { href?: string; extra?: ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="mb-6 flex items-center justify-between gap-3">
      <Link href={href} className="min-h-10 text-[16px] font-medium text-muted hover:text-ink">
        ← {t.playerHome}
      </Link>
      <div className="flex items-center gap-2">
        {extra}
      </div>
    </div>
  );
}

function SidePanel({
  title,
  caption,
  percent,
  coverTitle,
}: {
  title: string;
  caption: string;
  percent: number;
  coverTitle: string;
}) {
  return (
    <>
      <FullPhoto src={coverForSurvey(coverTitle, 0)} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-8 text-white">
        <p className="text-[15px] tracking-[0.2em] text-mint">{title}</p>
        <p className="mt-2 max-w-sm text-[17px] leading-7">{caption}</p>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/30">
          <div className="progress-mint h-full" style={{ width: `${Math.max(percent, 8)}%` }} />
        </div>
      </div>
    </>
  );
}

export function Player({ assignment, questionnaire, preview }: Props) {
  const [answers, setAnswers] = useState<Answers>(assignment.answers ?? {});
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(assignment.respondentRole ?? "");
  const [anonymous, setAnonymous] = useState(assignment.anonymous);
  const [staffAssisted, setStaffAssisted] = useState(assignment.staffAssisted);
  const [headerDone, setHeaderDone] = useState(Boolean(assignment.respondentRole) || preview);
  const [error, setError] = useState("");
  const [done, setDone] = useState(assignment.status === "submitted");
  const [pending, start] = useTransition();
  const { locale, t } = useLocale();
  const homeHref = preview ? "/admin/questionnaires" : "/";
  const shown = useMemo(
    () => localizeQuestionnaire(questionnaire, locale),
    [questionnaire, locale],
  );

  const visible = useMemo(
    () => visibleQuestions(shown.schema, answers),
    [shown.schema, answers],
  );
  const question = visible[step];
  const total = visible.length;
  const percent = total ? Math.round(((step + (headerDone ? 0 : 0)) / Math.max(total, 1)) * 100) : 0;
  const sectionTitle =
    shown.schema.sections.find((section) =>
      section.questions.some((item) => item.id === question?.id),
    )?.title ?? "";

  const persist = (next: Answers, extra?: Partial<AssignmentRecord>) => {
    if (preview) return;
    start(() => {
      void saveDraft(assignment.id, { answers: next, ...extra });
    });
  };

  const goNext = () => {
    if (!question) return;
    const message = validateQuestion(question, answers[question.id], locale);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    if (step >= total - 1) {
      if (preview) {
        setDone(true);
        return;
      }
      start(async () => {
        const result = await submitSurvey(
          assignment.id,
          answers,
          {
            respondentRole: role || null,
            anonymous,
            staffAssisted,
            filledAt: new Date().toISOString().slice(0, 10),
          },
          locale,
        );
        if (result.error) {
          setError(visitorError(result.error, t));
          return;
        }
        setDone(true);
      });
      return;
    }
    setStep((value) => value + 1);
  };

  if (done) {
    return (
      <Shell
        side={
          <SidePanel
            title={t.playerThanksSide}
            caption={t.playerThanksCaption}
            percent={100}
            coverTitle={questionnaire.title}
          />
        }
      >
        <HomeBar href={homeHref} />
        <div className="my-auto rounded-[32px] bg-card p-8 text-center shadow-[0_18px_50px_rgba(42,21,64,0.08)]">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-wash text-3xl font-extrabold text-mint-deep">
            {t.playerThanksMark}
          </div>
          <h1 className="text-3xl font-extrabold">{t.playerThanksTitle}</h1>
          <p className="mt-3 text-[17px] leading-7 text-muted">
            {preview ? t.playerThanksPreview : t.playerThanksBody}
          </p>
          <Link
            href={homeHref}
            className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-full bg-ink text-[18px] font-semibold text-white"
          >
            {t.playerHome}
          </Link>
        </div>
      </Shell>
    );
  }

  if (!headerDone) {
    return (
      <Shell
        side={
          <SidePanel
            title={shown.title}
            caption={shown.intro}
            percent={4}
            coverTitle={questionnaire.title}
          />
        }
      >
        <HomeBar href={homeHref} />
        <p className="text-base font-medium text-mint-deep">{t.playerStart}</p>
        <h1 className="mt-2 text-[30px] font-extrabold leading-tight lg:text-4xl">{shown.title}</h1>
        <p className="mt-4 text-[16px] leading-7 text-muted lg:text-[17px]">{shown.intro}</p>
        <div className="mt-6 space-y-4 rounded-[28px] bg-card p-5 shadow-[0_18px_50px_rgba(42,21,64,0.08)]">
          <p className="font-semibold">{t.playerRole}</p>
          <div className="flex flex-wrap gap-2">
            {roleKeys.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`rounded-full px-4 py-2 text-[15px] ${
                  role === value ? "bg-ink text-white" : "bg-white"
                }`}
              >
                {t.roles[value]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-[16px]">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            {t.playerAnon}
          </label>
          {questionnaire.settings.allowStaffAssisted ? (
            <label className="flex items-center gap-3 text-[16px]">
              <input
                type="checkbox"
                checked={staffAssisted}
                onChange={(e) => setStaffAssisted(e.target.checked)}
              />
              {t.playerAssist}
            </label>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => {
            if (!role) {
              setError(t.playerNeedRole);
              return;
            }
            setError("");
            setHeaderDone(true);
            persist(answers, { respondentRole: role, anonymous, staffAssisted });
          }}
          className="mt-6 h-14 w-full rounded-full bg-ink text-[18px] font-semibold text-white lg:max-w-sm"
        >
          {t.playerBegin}
        </button>
        {error ? <p className="mt-3 text-coral">{error}</p> : null}
      </Shell>
    );
  }

  if (!question) {
    return (
      <div className="p-8">
        <HomeBar href={homeHref} />
        <p>{t.playerEmpty}</p>
      </div>
    );
  }

  return (
    <Shell
      side={
        <SidePanel
          title={sectionTitle}
          caption={t.playerProgress(step + 1, total)}
          percent={Math.round((step / total) * 100)}
          coverTitle={questionnaire.title}
        />
      }
    >
      <HomeBar
        href={homeHref}
        extra={
          <>
            {staffAssisted ? (
              <span className="rounded-full bg-wash px-3 py-1 text-[13px] text-mint-deep">{t.playerAssistBadge}</span>
            ) : null}
            {preview ? <span className="rounded-full bg-plum px-3 py-1 text-[13px] text-white">{t.playerPreview}</span> : null}
          </>
        }
      />
      <header className="mb-4">
        <p className="text-base text-mint-deep">{sectionTitle}</p>
        <p className="text-[17px] font-semibold">{t.playerCount(step + 1, total)}</p>
      </header>
      <div className="mb-5 h-2 overflow-hidden rounded-full bg-white lg:hidden">
        <div className="progress-mint h-full rounded-full" style={{ width: `${Math.max(percent, 8)}%` }} />
      </div>
      <div className="flex-1">
        <h1 className="mb-5 text-[26px] font-extrabold leading-snug lg:text-[32px]">{question.title}</h1>
        {question.help ? <p className="mb-4 text-muted">{question.help}</p> : null}
        <QuestionWidget
          question={question}
          answers={answers}
          onChange={(value) => {
            const next = { ...answers, [question.id]: value };
            setAnswers(next);
            persist({ [question.id]: value });
          }}
        />
        {error ? <p className="mt-4 text-[16px] text-coral">{error}</p> : null}
      </div>
      <div className="sticky bottom-4 mt-8 flex items-center gap-3">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => {
            setError("");
            setStep((value) => Math.max(0, value - 1));
          }}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-card text-xl shadow-[0_18px_50px_rgba(42,21,64,0.08)] disabled:opacity-40"
          aria-label={t.playerPrev}
        >
          ←
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={goNext}
          className="h-14 flex-1 rounded-full bg-ink text-[18px] font-semibold text-white disabled:opacity-60"
        >
          {step >= total - 1 ? (preview ? t.playerPreviewDone : t.playerSubmit) : t.playerNext}
        </button>
      </div>
    </Shell>
  );
}
