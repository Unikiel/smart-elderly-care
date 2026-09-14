import { createQuestionnaire } from "@/lib/actions";
import { getCopy } from "@/lib/locale-server";
import { surveyHeading } from "@/lib/i18n";
import { listQuestionnaires } from "@/lib/store";

export default async function NewQuestionnairePage() {
  const { locale, t } = await getCopy();
  const existing = listQuestionnaires().filter((item) => item.status !== "archived");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-rose">{t.adminNewKicker}</p>
        <h1 className="mt-1 font-display text-4xl">{t.adminNewTitle}</h1>
        <p className="mt-3 leading-7 text-muted">{t.adminNewLead}</p>
      </div>

      <form
        action={async (formData) => {
          "use server";
          await createQuestionnaire(String(formData.get("title") ?? "未命名问卷"));
        }}
        className="space-y-4 rounded-[28px] bg-card p-6 shadow-[0_18px_50px_rgba(42,21,64,0.08)]"
      >
        <h2 className="font-display text-2xl">{t.adminBlank}</h2>
        <label className="block text-sm">
          {t.adminSurveyTitle}
          <input
            name="title"
            required
            placeholder={t.adminTitlePh}
            className="mt-2 w-full rounded-full bg-apricot/40 px-4 py-3"
          />
        </label>
        <button className="rounded-full bg-plum px-5 py-3 text-white">{t.adminCreateEdit}</button>
      </form>

      <div className="space-y-3">
        <h2 className="font-display text-2xl">{t.adminCopyExisting}</h2>
        {existing.map((item) => (
          <form
            key={item.id}
            action={async () => {
              "use server";
              await createQuestionnaire(item.title, item.id);
            }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white p-4"
          >
            <div>
              <p className="font-semibold">{surveyHeading(item.title, locale)}</p>
              <p className="text-sm text-muted">
                {item.status === "published" ? t.adminPublished : t.adminDraft} · v{item.version}
              </p>
            </div>
            <button className="rounded-full bg-canvas px-4 py-2 text-sm">{t.adminUseTemplate}</button>
          </form>
        ))}
      </div>
    </div>
  );
}
