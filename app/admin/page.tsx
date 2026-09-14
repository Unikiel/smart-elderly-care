import Link from "next/link";
import { createInvite } from "@/lib/actions";
import { getCopy } from "@/lib/locale-server";
import { surveyHeading } from "@/lib/i18n";
import { getQuestionnaire, listAssignments, listPublished, listResponses } from "@/lib/store";

export default async function AdminHome() {
  const { locale, t } = await getCopy();
  const assignments = listAssignments();
  const published = listPublished();
  const submitted = listResponses().length;
  const inProgress = assignments.filter((item) => item.status === "in_progress").length;
  const statusLabel: Record<string, string> = {
    pending: t.adminPending,
    in_progress: t.adminInProgress,
    submitted: t.adminSubmitted,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={t.adminInvites} value={assignments.length} />
        <Stat label={t.adminFilling} value={inProgress} tone="pending" />
        <Stat label={t.adminCollected} value={submitted} tone="mint" />
      </div>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
        <h2 className="font-bold">{t.adminNewInvite}</h2>
        <form
          action={async (formData) => {
            "use server";
            const questionnaireId = String(formData.get("questionnaireId") ?? "");
            const pin = String(formData.get("pin") ?? "");
            await createInvite({ questionnaireId, pin });
          }}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="text-sm">
            {t.adminSurvey}
            <select name="questionnaireId" className="mt-1 block rounded-full bg-canvas px-4 py-2">
              {published.map((item) => (
                <option key={item.id} value={item.id}>
                  {surveyHeading(item.title, locale)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {t.adminPinOptional}
            <input name="pin" className="mt-1 block rounded-full bg-canvas px-4 py-2" />
          </label>
          <button className="rounded-full bg-ink px-5 py-2 text-white">{t.adminMakeLink}</button>
        </form>
        <p className="mt-3 text-sm text-muted">{t.adminDemoLinks}</p>
      </section>

      <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold">{t.adminQueue}</h2>
        </div>
        <ul className="divide-y divide-[var(--line)]">
          {assignments.map((item) => {
            const q = getQuestionnaire(item.questionnaireId);
            return (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-semibold">
                    <Link href={`/admin/questionnaires/${item.questionnaireId}/report`} className="hover:underline">
                      {q ? surveyHeading(q.title, locale) : t.adminUnknownSurvey}
                    </Link>
                  </p>
                  <p className="text-sm text-muted">
                    /s/{item.inviteToken}
                    {item.pin ? ` · ${t.adminCode} ${item.pin}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      item.status === "submitted"
                        ? "bg-wash text-mint-deep"
                        : item.status === "in_progress"
                          ? "bg-[#fff7ed] text-pending"
                          : "bg-canvas text-muted"
                    }`}
                  >
                    {statusLabel[item.status]}
                  </span>
                  {item.status === "submitted" ? (
                    <Link
                      href={`/admin/responses/${item.id}`}
                      className="text-sm font-semibold"
                    >
                      {t.adminView}
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "mint" | "pending" }) {
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${tone === "mint" ? "text-mint-deep" : tone === "pending" ? "text-pending" : ""}`}>
        {value}
      </p>
    </div>
  );
}
