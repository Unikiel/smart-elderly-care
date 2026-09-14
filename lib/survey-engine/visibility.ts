import type { Answers, Question, QuestionnaireSchema, ShowIf } from "./types";

export function flattenQuestions(schema: QuestionnaireSchema): Question[] {
  return schema.sections.flatMap((section) => section.questions);
}

export function isShowIfMet(showIf: ShowIf | undefined, answers: Answers): boolean {
  if (!showIf) return true;
  const expected = Array.isArray(showIf.equals) ? showIf.equals : [showIf.equals];
  const raw = answers[showIf.questionId];
  if (!raw || typeof raw !== "object") return false;
  const rec = raw as { value?: unknown; values?: unknown };
  if (typeof rec.value === "string") return expected.includes(rec.value);
  if (Array.isArray(rec.values)) {
    return rec.values.some((value) => typeof value === "string" && expected.includes(value));
  }
  return false;
}

export function visibleQuestions(schema: QuestionnaireSchema, answers: Answers): Question[] {
  return flattenQuestions(schema).filter((question) => isShowIfMet(question.showIf, answers));
}

export function questionIndex(schema: QuestionnaireSchema, questionId: string, answers: Answers) {
  const visible = visibleQuestions(schema, answers);
  return visible.findIndex((question) => question.id === questionId);
}
