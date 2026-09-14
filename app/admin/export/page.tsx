import Link from "next/link";
import { getCopy } from "@/lib/locale-server";
import { surveyHeading } from "@/lib/i18n";
import { listPublished } from "@/lib/store";

export default async function ExportPage() {
  const { locale, t } = await getCopy();
  const published = listPublished();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">{t.adminExportTitle}</h1>
      <p className="text-muted">{t.adminExportHelp}</p>
      <ul className="space-y-3">
        {published.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-[22px] bg-white p-5">
            <p className="font-semibold">{surveyHeading(item.title, locale)}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/questionnaires/${item.id}/report`}
                className="rounded-full bg-ink px-4 py-2 text-sm text-white"
              >
                {t.adminReport}
              </Link>
              <Link href={`/admin/export/${item.id}`} className="rounded-full bg-canvas px-4 py-2 text-sm">
                {t.adminDownloadCsv}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
