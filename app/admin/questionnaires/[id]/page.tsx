import { notFound } from "next/navigation";
import { Builder } from "@/components/builder/Builder";
import { getQuestionnaire } from "@/lib/store";

export default async function EditQuestionnairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const questionnaire = getQuestionnaire(id);
  if (!questionnaire) notFound();
  return <Builder initial={questionnaire} />;
}
