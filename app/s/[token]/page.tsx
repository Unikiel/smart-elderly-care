import { notFound } from "next/navigation";
import { Splash } from "@/components/survey/Splash";
import { findAssignmentByToken, getQuestionnaire } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const assignment = findAssignmentByToken(token);
  if (!assignment) notFound();
  const questionnaire = getQuestionnaire(assignment.questionnaireId);
  if (!questionnaire) notFound();

  return <Splash token={token} title={questionnaire.title} requirePin={Boolean(assignment.pin)} />;
}
