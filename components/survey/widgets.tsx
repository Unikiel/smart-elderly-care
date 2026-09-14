"use client";

import type { Answers, Question } from "@/lib/survey-engine/types";
import { useLocale } from "@/components/i18n/LocaleProvider";

type Props = {
  question: Question;
  answers: Answers;
  onChange: (value: unknown) => void;
};

function rec(answers: Answers, id: string): Record<string, unknown> {
  const value = answers[id];
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function ChoiceRow({
  selected,
  label,
  onClick,
  multi,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-[22px] border px-4 py-4 text-left text-[18px] leading-7 transition ${
        selected
          ? "border-mint bg-wash shadow-[0_8px_24px_rgba(17,17,17,0.06)]"
          : "border-transparent bg-white hover:bg-[#fafafa]"
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center border-2 ${
          multi ? "rounded-md" : "rounded-full"
        } ${selected ? "border-mint bg-mint text-white" : "border-[#d4d7de] bg-white"}`}
      >
        {selected ? (
          <span className="block h-2.5 w-2.5 rounded-full bg-white" />
        ) : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function QuestionWidget({ question, answers, onChange }: Props) {
  const current = rec(answers, question.id);
  const { t } = useLocale();

  if (question.type === "longtext") {
    return (
      <textarea
        value={typeof current.text === "string" ? current.text : ""}
        onChange={(event) => onChange({ text: event.target.value })}
        rows={5}
        className="w-full resize-y rounded-[22px] border border-[var(--line)] bg-white px-4 py-4 text-[18px] leading-7"
        placeholder={t.playerWriteHere}
      />
    );
  }

  if (question.type === "matrix") {
    const cells = (current.cells as Record<string, string>) ?? {};
    return (
      <div className="space-y-4">
        {(question.rows ?? []).map((row) => (
          <div key={row.value} className="rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(17,17,17,0.04)]">
            <p className="mb-3 text-[17px] font-semibold">{row.label}</p>
            <div className="flex flex-wrap gap-2">
              {(question.scale ?? []).map((scale) => {
                const selected = cells[row.value] === scale.value;
                return (
                  <button
                    key={scale.value}
                    type="button"
                    onClick={() =>
                      onChange({
                        cells: { ...cells, [row.value]: scale.value },
                        note: current.note,
                      })
                    }
                    className={`rounded-full px-3 py-2 text-[14px] ${
                      selected ? "bg-ink text-white" : "bg-canvas text-ink"
                    }`}
                  >
                    {scale.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "multi") {
    const values = Array.isArray(current.values) ? (current.values as string[]) : [];
    const toggle = (value: string) => {
      const has = values.includes(value);
      if (!has && question.maxSelect && values.length >= question.maxSelect) return;
      onChange({
        values: has ? values.filter((item) => item !== value) : [...values, value],
        other: current.other,
      });
    };
    return (
      <div className="space-y-2">
        {question.maxSelect ? (
          <p className="text-[15px] text-muted">
            {t.playerPicked(values.length, question.maxSelect)}
          </p>
        ) : null}
        <div className="grid gap-2 rounded-[26px] bg-[#f3f4f6] p-2 sm:grid-cols-2">
          {(question.options ?? []).map((option) => (
            <ChoiceRow
              key={option.value}
              multi
              selected={values.includes(option.value)}
              label={option.label}
              onClick={() => toggle(option.value)}
            />
          ))}
        </div>
        {question.allowOther && values.includes("other") ? (
          <input
            value={typeof current.other === "string" ? current.other : ""}
            onChange={(event) => onChange({ values, other: event.target.value })}
            className="mt-2 w-full rounded-full border border-[var(--line)] bg-white px-5 py-3 text-[17px]"
            placeholder={t.playerWriteOther}
          />
        ) : null}
      </div>
    );
  }

  const value = typeof current.value === "string" ? current.value : "";
  return (
    <div className="space-y-2">
      <div className="grid gap-2 rounded-[26px] bg-[#f3f4f6] p-2 sm:grid-cols-2">
        {(question.options ?? []).map((option) => (
          <ChoiceRow
            key={option.value}
            selected={value === option.value}
            label={option.label}
            onClick={() => onChange({ value: option.value, other: current.other })}
          />
        ))}
      </div>
      {question.allowOther && value === "other" ? (
        <input
          value={typeof current.other === "string" ? current.other : ""}
          onChange={(event) => onChange({ value, other: event.target.value })}
          className="mt-2 w-full rounded-full border border-[var(--line)] bg-white px-5 py-3 text-[17px]"
            placeholder={t.playerWriteOther}
        />
      ) : null}
    </div>
  );
}
