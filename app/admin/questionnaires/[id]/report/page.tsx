import Link from "next/link";
import { notFound } from "next/navigation";
import { getCopy } from "@/lib/locale-server";
import { surveyHeading } from "@/lib/i18n";
import { localizeQuestionnaire } from "@/lib/survey-locale";
import { buildSurveyReport, type OptionTally, type QuestionTally } from "@/lib/survey-engine/report";
import { getQuestionnaire, listAssignments, listResponses } from "@/lib/store";
import { copy, type Locale } from "@/lib/i18n";

type T = (typeof copy)[Locale];

function pct(count: number, of: number) {
  if (!of) return 0;
  return Math.round((count / of) * 100);
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function ChoiceBars({ options, of }: { options: OptionTally[]; of: number }) {
  const max = Math.max(1, ...options.map((item) => item.count));
  return (
    <ul className="space-y-3">
      {options.map((option) => (
        <li key={option.value}>
          <div className="flex items-end justify-between gap-3 text-[15px]">
            <p className="min-w-0 font-medium">{option.label}</p>
            <p className="shrink-0 tabular-nums text-muted">
              {option.count}
              {of ? ` · ${pct(option.count, of)}%` : ""}
            </p>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-[#3a2718]"
              style={{ width: `${Math.max(option.count ? 6 : 0, (option.count / max) * 100)}%` }}
            />
          </div>
          {option.others.length ? (
            <ul className="mt-2 space-y-1 text-[14px] leading-6 text-muted">
              {option.others.map((note, index) => (
                <li key={`${option.value}-${index}`}>“{note}”</li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function QuestionBlock({ item, t }: { item: QuestionTally; t: T }) {
  return (
    <article className="rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
      <p className="text-sm text-muted">{item.question.id}</p>
      <h2 className="mt-1 text-lg font-bold leading-snug">{item.question.title}</h2>
      <p className="mt-2 text-sm text-muted">
        {t.adminReportAnswered(item.answered, item.answered + item.skipped)}
        {item.skipped ? ` · ${t.adminReportSkipped(item.skipped)}` : ""}
      </p>
      <div className="mt-4">
        {item.kind === "choice" ? <ChoiceBars options={item.options} of={item.answered} /> : null}
        {item.kind === "matrix" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[14px]">
              <thead>
                <tr>
                  <th className="pb-2 pr-3 font-medium text-muted" />
                  {item.scale.map((scale) => (
                    <th key={scale.value} className="px-2 pb-2 text-center font-medium text-muted">
                      {scale.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.rows.map((row) => {
                  const peak = Math.max(1, ...row.cells.map((cell) => cell.count));
                  return (
                    <tr key={row.value} className="border-t border-[var(--line)]">
                      <th className="py-3 pr-3 font-semibold">{row.label}</th>
                      {row.cells.map((cell) => (
                        <td key={cell.value} className="px-2 py-3 text-center tabular-nums">
                          <span
                            className="inline-grid min-h-9 min-w-9 place-items-center rounded-full"
                            style={{
                              background:
                                cell.count === 0
                                  ? "transparent"
                                  : `rgba(58,39,24,${0.08 + (cell.count / peak) * 0.28})`,
                            }}
                          >
                            {cell.count}
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {item.kind === "text" ? (
          item.notes.length === 0 ? (
            <p className="text-muted">{t.adminReportNoNotes}</p>
          ) : (
            <ul className="space-y-3">
              <p className="text-sm font-medium">{t.adminReportWritten}</p>
              {item.notes.map((note) => (
                <li key={`${note.assignmentId}-${note.submittedAt}`} className="rounded-[18px] bg-canvas px-4 py-3">
                  <p className="whitespace-pre-wrap text-[15px] leading-7">{note.text}</p>
                  <Link href={`/admin/responses/${note.assignmentId}`} className="mt-2 inline-block text-sm font-semibold">
                    {t.adminReportOpen}
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </article>
  );
}

export default async function SurveyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale, t } = await getCopy();
  const questionnaire = getQuestionnaire(id);
  if (!questionnaire) notFound();
  const shown = localizeQuestionnaire(questionnaire, locale);
  const responses = listResponses().filter((item) => item.questionnaireId === id);
  const filling = listAssignments().filter(
    (item) => item.questionnaireId === id && item.status === "in_progress",
  ).length;
  const report = buildSurveyReport(shown.schema, responses);
  const roleRows = Object.entries(report.roles);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/questionnaires" className="text-sm text-muted">
          ← {t.adminBackSurveys}
        </Link>
        <p className="mt-4 font-script text-[26px] leading-none text-[#b45309]">{t.adminReportKicker}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight">
            {surveyHeading(questionnaire.title, locale)}
          </h1>
          <Link
            href={`/admin/export/${questionnaire.id}`}
            className="rounded-full bg-canvas px-4 py-2 text-sm font-medium"
          >
            {t.adminDownloadCsv}
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted">{t.adminReportCsvHint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.adminCollected} value={report.total} />
        <Stat label={t.adminReportFilling} value={filling} />
        <Stat label={t.adminAnon} value={report.anonymous} />
        <Stat label={t.adminAssistedFill} value={report.assisted} />
      </div>

      {roleRows.length ? (
        <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
          <h2 className="font-bold">{t.adminReportWho}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {roleRows.map(([role, count]) => (
              <li key={role} className="flex items-center justify-between rounded-full bg-canvas px-4 py-2">
                <span>{role in t.roles ? t.roles[role as keyof typeof t.roles] : t.adminNoRole}</span>
                <span className="tabular-nums font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.total === 0 ? (
        <p className="rounded-[28px] bg-white p-8 text-[17px] leading-8 text-muted">{t.adminReportEmpty}</p>
      ) : (
        <div className="space-y-4">
          {report.questions.map((item) => (
            <QuestionBlock key={item.question.id} item={item} t={t} />
          ))}
        </div>
      )}

      {report.replies.length ? (
        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
          <div className="px-5 py-4">
            <h2 className="font-bold">{t.adminReportReplies}</h2>
          </div>
          <ul className="divide-y divide-[var(--line)]">
            {report.replies.map((reply) => (
              <li key={reply.assignmentId} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold">
                    {reply.anonymous ? t.adminAnon : t.adminNamed} ·{" "}
                    {reply.role && reply.role in t.roles
                      ? t.roles[reply.role as keyof typeof t.roles]
                      : t.adminNoRole}
                  </p>
                  <p className="text-sm text-muted">
                    {reply.assisted ? t.adminAssistedFill : t.adminSelfFill} · {reply.submittedAt.slice(0, 16).replace("T", " ")}
                  </p>
                </div>
                <Link href={`/admin/responses/${reply.assignmentId}`} className="text-sm font-semibold">
                  {t.adminView}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
