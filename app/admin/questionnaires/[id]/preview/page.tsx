import { notFound } from "next/navigation";
import { Player } from "@/components/survey/Player";
import { getQuestionnaire } from "@/lib/store";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const questionnaire = getQuestionnaire(id);
  if (!questionnaire) notFound();

  return (
    <div className="-mx-5 -my-6 min-h-dvh bg-canvas">
      <Player
        preview
        questionnaire={questionnaire}
        assignment={{
          id: "preview",
          questionnaireId: questionnaire.id,
          inviteToken: "preview",
          pin: null,
          status: "in_progress",
          respondentRole: "elder",
          anonymous: true,
          staffAssisted: false,
          followUpOf: null,
          filledAt: null,
          answers: {},
          createdAt: new Date().toISOString(),
        }}
      />
    </div>
  );
}
