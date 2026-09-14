import Link from "next/link";
import { notFound } from "next/navigation";
import { flattenQuestions } from "@/lib/survey-engine/visibility";
import { getAssignment, getQuestionnaire, getResponseByAssignment } from "@/lib/store";
import { getCopy } from "@/lib/locale-server";
import { localizeQuestionnaire, surveyHeading } from "@/lib/survey-locale";

function formatAnswer(raw: unknown, otherLabel: string): string {
  if (!raw || typeof raw !== "object") return "—";
  const rec = raw as Record<string, unknown>;
  if (typeof rec.text === "string") return rec.text || "—";
  if (typeof rec.value === "string") {
    return rec.value === "other" && rec.other ? `${otherLabel}：${rec.other}` : rec.value;
  }
  if (Array.isArray(rec.values)) {
    const extra = rec.other ? `；${otherLabel}：${rec.other}` : "";
    return `${(rec.values as string[]).join("、")}${extra}` || "—";
  }
  if (rec.cells && typeof rec.cells === "object") {
    return Object.entries(rec.cells as Record<string, string>)
      .map(([key, value]) => `${key}:${value}`)
      .join("；");
  }
  return "—";
}

export default async function ResponsePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale, t } = await getCopy();
  const assignment = getAssignment(id);
  const response = getResponseByAssignment(id);
  if (!assignment || !response) notFound();
  const questionnaire = getQuestionnaire(assignment.questionnaireId);
  if (!questionnaire) notFound();
  const shown = localizeQuestionnaire(questionnaire, locale);
  const questions = flattenQuestions(shown.schema);
  const roleLabel =
    response.header.respondentRole && response.header.respondentRole in t.roles
      ? t.roles[response.header.respondentRole as keyof typeof t.roles]
      : (response.header.respondentRole ?? t.adminNoRole);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href={`/admin/questionnaires/${questionnaire.id}/report`} className="text-muted">
          ← {t.adminReport}
        </Link>
        <Link href="/admin" className="text-muted">
          {t.adminBackQueue}
        </Link>
      </div>
      <h1 className="text-2xl font-extrabold">{surveyHeading(questionnaire.title, locale)}</h1>
      <p className="text-sm text-muted">
        {response.header.anonymous ? t.adminAnon : t.adminNamed} · {roleLabel} ·{" "}
        {response.header.staffAssisted ? t.adminAssistedFill : t.adminSelfFill} · {response.submittedAt.slice(0, 16)}
      </p>
      <ul className="space-y-3">
        {questions.map((question) => (
          <li key={question.id} className="rounded-[22px] bg-white p-4">
            <p className="text-sm text-muted">{question.id}</p>
            <p className="font-semibold">{question.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
              {formatAnswer(response.answers[question.id], t.adminOtherLabel)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
