import { notFound } from "next/navigation";
import { Player } from "@/components/survey/Player";
import { getAssignment, getQuestionnaire } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const assignment = getAssignment(assignmentId);
  if (!assignment) notFound();
  const questionnaire = getQuestionnaire(assignment.questionnaireId);
  if (!questionnaire) notFound();
  return <Player assignment={assignment} questionnaire={questionnaire} />;
}
