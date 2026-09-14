import Link from "next/link";
import { archiveQuestionnaire, createQuestionnaire } from "@/lib/actions";
import { getCopy } from "@/lib/locale-server";
import { surveyHeading } from "@/lib/i18n";
import { countResponsesFor, listQuestionnaires } from "@/lib/store";

export default async function QuestionnairesPage() {
  const { locale, t } = await getCopy();
  const items = listQuestionnaires();
  const statusLabel = {
    draft: t.adminDraft,
    published: t.adminPublished,
    archived: t.adminArchived,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t.adminSurveysTitle}</h1>
        <Link href="/admin/questionnaires/new" className="rounded-full bg-plum px-4 py-2 text-white">
          {t.adminNewKicker}
        </Link>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded-[28px] bg-white p-5 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">
                  {statusLabel[item.status]} · v{item.version} · {countResponsesFor(item.id)} {t.adminRepliesOf}
                </p>
                <h2 className="mt-1 text-lg font-bold">{surveyHeading(item.title, locale)}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/questionnaires/${item.id}/report`}
                  className="rounded-full bg-ink px-4 py-2 text-sm text-white"
                >
                  {t.adminReport}
                </Link>
                <Link href={`/admin/questionnaires/${item.id}`} className="rounded-full bg-canvas px-4 py-2 text-sm">
                  {t.adminEdit}
                </Link>
                <Link
                  href={`/admin/questionnaires/${item.id}/preview`}
                  className="rounded-full bg-canvas px-4 py-2 text-sm"
                >
                  {t.adminPreview}
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await createQuestionnaire(item.title, item.id);
                  }}
                >
                  <button className="rounded-full bg-canvas px-4 py-2 text-sm">{t.adminCopy}</button>
                </form>
                {item.status !== "archived" ? (
                  <form
                    action={async () => {
                      "use server";
                      await archiveQuestionnaire(item.id);
                    }}
                  >
                    <button className="rounded-full bg-canvas px-4 py-2 text-sm">{t.adminArchive}</button>
                  </form>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
