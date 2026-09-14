import { flattenQuestions } from "./visibility";
import type { Option, Question, QuestionnaireSchema, ResponseRecord } from "./types";

function asRec(raw: unknown): Record<string, unknown> | null {
  return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
}

export type OptionTally = {
  value: string;
  label: string;
  count: number;
  others: string[];
};

export type MatrixRowTally = {
  value: string;
  label: string;
  cells: OptionTally[];
};

export type QuestionTally =
  | {
      question: Question;
      answered: number;
      skipped: number;
      kind: "choice";
      options: OptionTally[];
    }
  | {
      question: Question;
      answered: number;
      skipped: number;
      kind: "matrix";
      rows: MatrixRowTally[];
      scale: Option[];
    }
  | {
      question: Question;
      answered: number;
      skipped: number;
      kind: "text";
      notes: { assignmentId: string; text: string; submittedAt: string }[];
    };

export type SurveyReport = {
  total: number;
  anonymous: number;
  named: number;
  assisted: number;
  roles: Record<string, number>;
  questions: QuestionTally[];
  replies: {
    assignmentId: string;
    submittedAt: string;
    role: string | null;
    anonymous: boolean;
    assisted: boolean;
  }[];
};

function answered(question: Question, raw: unknown): boolean {
  const rec = asRec(raw);
  if (!rec) return false;
  if (question.type === "single") return typeof rec.value === "string" && rec.value.length > 0;
  if (question.type === "multi") return Array.isArray(rec.values) && rec.values.some((v) => typeof v === "string");
  if (question.type === "matrix") {
    const cells = asRec(rec.cells) ?? {};
    return (question.rows ?? []).some((row) => typeof cells[row.value] === "string" && cells[row.value]);
  }
  return typeof rec.text === "string" && rec.text.trim().length > 0;
}

function emptyCounts(options: Option[] | undefined): Map<string, OptionTally> {
  const map = new Map<string, OptionTally>();
  for (const option of options ?? []) {
    map.set(option.value, { value: option.value, label: option.label, count: 0, others: [] });
  }
  return map;
}

function bump(map: Map<string, OptionTally>, value: string, fallbackLabel: string, other?: string) {
  const current = map.get(value) ?? { value, label: fallbackLabel, count: 0, others: [] };
  current.count += 1;
  if (other?.trim()) current.others.push(other.trim());
  map.set(value, current);
}

export function buildSurveyReport(schema: QuestionnaireSchema, responses: ResponseRecord[]): SurveyReport {
  const total = responses.length;
  const roles: Record<string, number> = {};
  let anonymous = 0;
  let named = 0;
  let assisted = 0;

  for (const response of responses) {
    const role = response.header.respondentRole ?? "unknown";
    roles[role] = (roles[role] ?? 0) + 1;
    if (response.header.anonymous) anonymous += 1;
    else named += 1;
    if (response.header.staffAssisted) assisted += 1;
  }

  const questions: QuestionTally[] = flattenQuestions(schema).map((question) => {
    const skipped = responses.filter((response) => !answered(question, response.answers[question.id])).length;
    const answeredCount = total - skipped;

    if (question.type === "longtext") {
      const notes = responses
        .map((response) => {
          const rec = asRec(response.answers[question.id]);
          const text = typeof rec?.text === "string" ? rec.text.trim() : "";
          return text
            ? { assignmentId: response.assignmentId, text, submittedAt: response.submittedAt }
            : null;
        })
        .filter((item): item is { assignmentId: string; text: string; submittedAt: string } => Boolean(item));
      return { question, answered: answeredCount, skipped, kind: "text", notes };
    }

    if (question.type === "matrix") {
      const scale = question.scale ?? [];
      const rows = (question.rows ?? []).map((row) => {
        const cells = emptyCounts(scale);
        for (const response of responses) {
          const rec = asRec(response.answers[question.id]);
          const picked = asRec(rec?.cells)?.[row.value];
          if (typeof picked === "string" && picked) {
            const match = scale.find((item) => item.value === picked);
            bump(cells, picked, match?.label ?? picked);
          }
        }
        return { value: row.value, label: row.label, cells: [...cells.values()] };
      });
      return { question, answered: answeredCount, skipped, kind: "matrix", rows, scale };
    }

    const options = emptyCounts(question.options);
    for (const response of responses) {
      const rec = asRec(response.answers[question.id]);
      const other = typeof rec?.other === "string" ? rec.other : "";
      if (question.type === "multi") {
        const values = Array.isArray(rec?.values) ? rec.values : [];
        for (const value of values) {
          if (typeof value !== "string") continue;
          const match = question.options?.find((item) => item.value === value);
          bump(options, value, match?.label ?? value, value === "other" ? other : undefined);
        }
      } else {
        const value = typeof rec?.value === "string" ? rec.value : "";
        if (!value) continue;
        const match = question.options?.find((item) => item.value === value);
        bump(options, value, match?.label ?? value, value === "other" ? other : undefined);
      }
    }
    return { question, answered: answeredCount, skipped, kind: "choice", options: [...options.values()] };
  });

  const replies = [...responses]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .map((response) => ({
      assignmentId: response.assignmentId,
      submittedAt: response.submittedAt,
      role: response.header.respondentRole,
      anonymous: response.header.anonymous,
      assisted: response.header.staffAssisted,
    }));

  return { total, anonymous, named, assisted, roles, questions, replies };
}
