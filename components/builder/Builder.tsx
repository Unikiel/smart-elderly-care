"use client";

import { useState, useTransition } from "react";
import { cloneNewVersion, publishQuestionnaire, saveQuestionnaire } from "@/lib/actions";
import type { Question, QuestionnaireRecord, Section } from "@/lib/survey-engine/types";
import { uid } from "@/lib/client-id";

const types: { value: Question["type"]; label: string }[] = [
  { value: "single", label: "单选" },
  { value: "multi", label: "多选" },
  { value: "matrix", label: "矩阵评价" },
  { value: "longtext", label: "开放题" },
];

export function Builder({ initial }: { initial: QuestionnaireRecord }) {
  const [title, setTitle] = useState(initial.title);
  const [intro, setIntro] = useState(initial.intro);
  const [sections, setSections] = useState<Section[]>(initial.schema.sections);
  const [settings, setSettings] = useState(initial.settings);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const locked = initial.status === "published";

  const schema = { ...initial.schema, title, intro, sections };

  const save = () => {
    start(async () => {
      const result = await saveQuestionnaire(initial.id, { title, intro, schema, settings });
      setMessage(result.error ?? "已保存");
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            {initial.status === "published" ? "已发布" : initial.status === "draft" ? "草稿" : "已归档"} · v
            {initial.version}
          </p>
          <input
            value={title}
            disabled={locked}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full max-w-xl bg-transparent text-2xl font-extrabold outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {locked ? (
            <button
              type="button"
              onClick={() => start(() => { void cloneNewVersion(initial.id); })}
              className="rounded-full bg-ink px-4 py-2 text-white"
            >
              复制为新版本
            </button>
          ) : (
            <>
              <button type="button" disabled={pending} onClick={save} className="rounded-full bg-canvas px-4 py-2">
                保存草稿
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await saveQuestionnaire(initial.id, { title, intro, schema, settings });
                    const result = await publishQuestionnaire(initial.id);
                    setMessage(result.error ?? "已发布");
                  })
                }
                className="rounded-full bg-ink px-4 py-2 text-white"
              >
                发布
              </button>
            </>
          )}
        </div>
      </div>
      {message ? <p className="text-sm text-mint-deep">{message}</p> : null}

      <textarea
        value={intro}
        disabled={locked}
        onChange={(event) => setIntro(event.target.value)}
        rows={4}
        className="w-full rounded-[22px] bg-white p-4"
        placeholder="问卷说明"
      />

      <div className="flex flex-wrap gap-4 rounded-[22px] bg-white p-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled={locked}
            checked={settings.anonymousDefault}
            onChange={(event) => setSettings({ ...settings, anonymousDefault: event.target.checked })}
          />
          默认匿名
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled={locked}
            checked={settings.allowStaffAssisted}
            onChange={(event) => setSettings({ ...settings, allowStaffAssisted: event.target.checked })}
          />
          允许工作人员代填
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            disabled={locked}
            checked={settings.requirePin}
            onChange={(event) => setSettings({ ...settings, requirePin: event.target.checked })}
          />
          需要填写码
        </label>
      </div>

      {sections.map((section, sectionIndex) => (
        <section key={section.id} className="rounded-[28px] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <input
              value={section.title}
              disabled={locked}
              onChange={(event) => {
                const next = [...sections];
                next[sectionIndex] = { ...section, title: event.target.value };
                setSections(next);
              }}
              className="flex-1 text-lg font-bold"
            />
            {!locked ? (
              <button
                type="button"
                className="text-sm text-muted"
                onClick={() => setSections(sections.filter((item) => item.id !== section.id))}
              >
                删除部分
              </button>
            ) : null}
          </div>
          <div className="space-y-4">
            {section.questions.map((question, questionIndex) => (
              <QuestionEditor
                key={question.id}
                question={question}
                locked={locked}
                allQuestions={sections.flatMap((item) => item.questions)}
                onChange={(nextQuestion) => {
                  const next = [...sections];
                  const questions = [...section.questions];
                  questions[questionIndex] = nextQuestion;
                  next[sectionIndex] = { ...section, questions };
                  setSections(next);
                }}
                onRemove={() => {
                  const next = [...sections];
                  next[sectionIndex] = {
                    ...section,
                    questions: section.questions.filter((item) => item.id !== question.id),
                  };
                  setSections(next);
                }}
              />
            ))}
          </div>
          {!locked ? (
            <button
              type="button"
              className="mt-4 rounded-full bg-canvas px-4 py-2 text-sm"
              onClick={() => {
                const next = [...sections];
                next[sectionIndex] = {
                  ...section,
                  questions: [
                    ...section.questions,
                    {
                      id: uid("q"),
                      type: "single",
                      title: "新题目",
                      required: true,
                      options: [
                        { value: "a", label: "选项 A" },
                        { value: "b", label: "选项 B" },
                      ],
                    },
                  ],
                };
                setSections(next);
              }}
            >
              添加题目
            </button>
          ) : null}
        </section>
      ))}

      {!locked ? (
        <button
          type="button"
          className="rounded-full bg-white px-4 py-2"
          onClick={() =>
            setSections([...sections, { id: uid("sec"), title: "新的部分", questions: [] }])
          }
        >
          添加部分
        </button>
      ) : null}
    </div>
  );
}

function QuestionEditor({
  question,
  locked,
  allQuestions,
  onChange,
  onRemove,
}: {
  question: Question;
  locked: boolean;
  allQuestions: Question[];
  onChange: (question: Question) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[22px] bg-canvas p-4">
      <div className="flex flex-wrap gap-2">
        <select
          disabled={locked}
          value={question.type}
          onChange={(event) => onChange({ ...question, type: event.target.value as Question["type"] })}
          className="rounded-full bg-white px-3 py-1 text-sm"
        >
          {types.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            disabled={locked}
            checked={Boolean(question.required)}
            onChange={(event) => onChange({ ...question, required: event.target.checked })}
          />
          必填
        </label>
        {!locked ? (
          <button type="button" onClick={onRemove} className="ml-auto text-sm text-muted">
            删除
          </button>
        ) : null}
      </div>
      <input
        disabled={locked}
        value={question.title}
        onChange={(event) => onChange({ ...question, title: event.target.value })}
        className="mt-3 w-full bg-transparent text-[16px] font-semibold"
      />
      {(question.type === "single" || question.type === "multi") && (
        <div className="mt-3 space-y-2">
          {(question.options ?? []).map((option, index) => (
            <div key={option.value} className="flex gap-2">
              <input
                disabled={locked}
                value={option.label}
                onChange={(event) => {
                  const options = [...(question.options ?? [])];
                  options[index] = { ...option, label: event.target.value };
                  onChange({ ...question, options });
                }}
                className="flex-1 rounded-full bg-white px-3 py-1"
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={locked}
                checked={Boolean(question.allowOther)}
                onChange={(event) => onChange({ ...question, allowOther: event.target.checked })}
              />
              允许其他
            </label>
            {question.type === "multi" ? (
              <label className="flex items-center gap-1">
                最多
                <input
                  disabled={locked}
                  type="number"
                  min={1}
                  value={question.maxSelect ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...question,
                      maxSelect: event.target.value ? Number(event.target.value) : undefined,
                    })
                  }
                  className="w-16 rounded-full bg-white px-2 py-1"
                />
                项
              </label>
            ) : null}
            {!locked ? (
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...question,
                    options: [...(question.options ?? []), { value: uid("opt"), label: "新选项" }],
                  })
                }
              >
                加选项
              </button>
            ) : null}
          </div>
        </div>
      )}
      {question.type === "matrix" && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted">评价行</p>
            {(question.rows ?? []).map((row, index) => (
              <input
                key={row.value}
                disabled={locked}
                value={row.label}
                onChange={(event) => {
                  const rows = [...(question.rows ?? [])];
                  rows[index] = { ...row, label: event.target.value };
                  onChange({ ...question, rows });
                }}
                className="mt-1 w-full rounded-full bg-white px-3 py-1"
              />
            ))}
            {!locked ? (
              <button
                type="button"
                className="mt-2 text-sm"
                onClick={() =>
                  onChange({
                    ...question,
                    rows: [...(question.rows ?? []), { value: uid("row"), label: "新评价项" }],
                    scale: question.scale?.length
                      ? question.scale
                      : [
                          { value: "very", label: "很满意" },
                          { value: "ok", label: "还可以" },
                          { value: "mid", label: "一般" },
                          { value: "low", label: "不太满意" },
                          { value: "bad", label: "不满意" },
                        ],
                  })
                }
              >
                加一行
              </button>
            ) : null}
          </div>
        </div>
      )}
      <label className="mt-3 block text-sm text-muted">
        仅当某题选择特定项时显示
        <select
          disabled={locked}
          value={question.showIf?.questionId ?? ""}
          onChange={(event) =>
            onChange({
              ...question,
              showIf: event.target.value
                ? { questionId: event.target.value, equals: question.showIf?.equals ?? "" }
                : undefined,
            })
          }
          className="mt-1 block w-full rounded-full bg-white px-3 py-1"
        >
          <option value="">无跳题</option>
          {allQuestions
            .filter((item) => item.id !== question.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
        </select>
        {question.showIf ? (
          <input
            disabled={locked}
            value={Array.isArray(question.showIf.equals) ? question.showIf.equals.join(",") : question.showIf.equals}
            onChange={(event) =>
              onChange({
                ...question,
                showIf: {
                  questionId: question.showIf!.questionId,
                  equals: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                },
              })
            }
            placeholder="选项值，逗号分隔，如 yes,maybe"
            className="mt-2 w-full rounded-full bg-white px-3 py-1"
          />
        ) : null}
      </label>
    </div>
  );
}
