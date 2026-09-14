import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { flattenQuestions } from "@/lib/survey-engine/visibility";
import { getQuestionnaire, listResponses } from "@/lib/store";

function cell(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const rec = raw as Record<string, unknown>;
  if (typeof rec.text === "string") return rec.text;
  if (typeof rec.value === "string") {
    return rec.value === "other" && rec.other ? `其他:${rec.other}` : rec.value;
  }
  if (Array.isArray(rec.values)) {
    const extra = rec.other ? `;其他:${rec.other}` : "";
    return `${(rec.values as string[]).join("|")}${extra}`;
  }
  if (rec.cells && typeof rec.cells === "object") {
    return Object.entries(rec.cells as Record<string, string>)
      .map(([key, value]) => `${key}=${value}`)
      .join("|");
  }
  return "";
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const { id } = await params;
  const questionnaire = getQuestionnaire(id);
  if (!questionnaire) return new NextResponse("not found", { status: 404 });
  const questions = flattenQuestions(questionnaire.schema);
  const rows = listResponses().filter((item) => item.questionnaireId === id);
  const header = [
    "submittedAt",
    "anonymous",
    "role",
    "staffAssisted",
    ...questions.map((question) => question.id),
  ];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.submittedAt,
        String(row.header.anonymous),
        row.header.respondentRole ?? "",
        String(row.header.staffAssisted),
        ...questions.map((question) => cell(row.answers[question.id])),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];
  const body = `\uFEFF${lines.join("\n")}`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${questionnaire.schema.id || "survey"}.csv"`,
    },
  });
}
