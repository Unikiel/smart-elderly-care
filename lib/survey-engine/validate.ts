import { copy, type Locale } from "../i18n";
import type { Answers, Question, QuestionnaireSchema } from "./types";
import { visibleQuestions } from "./visibility";

export type QuestionError = { questionId: string; message: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function validateQuestion(question: Question, raw: unknown, locale: Locale = "zh"): string | null {
  if (!question.required && (raw == null || raw === "")) return null;
  const rec = asRecord(raw);
  const t = copy[locale];

  if (question.type === "single") {
    const value = rec?.value;
    if (question.required && (typeof value !== "string" || !value)) {
      return t.validPickOne;
    }
    if (value === "other" && question.allowOther && !String(rec?.other ?? "").trim()) {
      return t.validFillOther;
    }
    return null;
  }

  if (question.type === "multi") {
    const values = Array.isArray(rec?.values) ? (rec.values as unknown[]) : [];
    const picked = values.filter((value): value is string => typeof value === "string");
    if (question.required && picked.length === 0) return t.validPickLeast;
    if (question.maxSelect && picked.length > question.maxSelect) {
      return t.validMaxSelect(question.maxSelect);
    }
    if (picked.includes("other") && question.allowOther && !String(rec?.other ?? "").trim()) {
      return t.validFillOther;
    }
    return null;
  }

  if (question.type === "matrix") {
    const cells = asRecord(rec?.cells) ?? {};
    const rows = question.rows ?? [];
    const missing = rows.filter((row) => !cells[row.value]);
    if (question.required && missing.length > 0) {
      return t.validMatrix;
    }
    return null;
  }

  const text = typeof rec?.text === "string" ? rec.text : typeof raw === "string" ? raw : "";
  if (question.required && !text.trim()) return t.validWrite;
  return null;
}

export function validateAnswers(
  schema: QuestionnaireSchema,
  answers: Answers,
  locale: Locale = "zh",
): QuestionError[] {
  return visibleQuestions(schema, answers)
    .map((question) => {
      const message = validateQuestion(question, answers[question.id], locale);
      return message ? { questionId: question.id, message } : null;
    })
    .filter((error): error is QuestionError => Boolean(error));
}

export function validateSchema(schema: QuestionnaireSchema): string[] {
  const errors: string[] = [];
  if (!schema.title.trim()) errors.push("请填写问卷标题");
  if (schema.sections.length === 0) errors.push("至少需要一个部分");
  const ids = new Set<string>();
  for (const section of schema.sections) {
    if (!section.title.trim()) errors.push("部分标题不能为空");
    for (const question of section.questions) {
      if (!question.title.trim()) errors.push("题目不能为空");
      if (ids.has(question.id)) errors.push(`题目编号重复：${question.id}`);
      ids.add(question.id);
      if ((question.type === "single" || question.type === "multi") && (question.options?.length ?? 0) < 2) {
        errors.push(`${question.title || question.id} 至少需要两个选项`);
      }
      if (question.type === "multi" && question.maxSelect != null && question.maxSelect < 1) {
        errors.push(`${question.title || question.id} 最多选择数无效`);
      }
      if (question.type === "matrix" && ((question.rows?.length ?? 0) < 1 || (question.scale?.length ?? 0) < 2)) {
        errors.push(`${question.title || question.id} 矩阵题需要行和量表`);
      }
      if (question.showIf && !ids.has(question.showIf.questionId) && question.showIf.questionId !== question.id) {
        const known = flattenIds(schema);
        if (!known.has(question.showIf.questionId)) {
          errors.push(`${question.title || question.id} 跳题逻辑指向不存在的题目`);
        }
      }
    }
  }
  return errors;
}

function flattenIds(schema: QuestionnaireSchema) {
  return new Set(schema.sections.flatMap((section) => section.questions.map((question) => question.id)));
}
