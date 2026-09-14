"use server";

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, createSession, getSessionUser, loginStaff } from "./auth";
import { makeSalt, hashPassword } from "./auth-hash";
import { parseStoriesPack } from "./stories";
import {
  countResponsesFor,
  findAssignmentByToken,
  getAssignment,
  getQuestionnaire,
  getStore,
  isPublicEntryToken,
  listAssignments,
  listQuestionnaires,
  listResponses,
  mutate,
  uid,
  token,
} from "./store";
import type {
  Answers,
  AssignmentRecord,
  QuestionnaireRecord,
  QuestionnaireSchema,
  QuestionnaireSettings,
} from "./survey-engine/types";
import { validateAnswers, validateSchema } from "./survey-engine/validate";
import type { Locale } from "./i18n";

async function requireStaff() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function loginAction(_prev: { error: string }, formData: FormData) {
  const login = String(formData.get("login") ?? formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/admin";
  const user = loginStaff(login, password);
  if (!user) return { error: "login_bad" };
  await createSession(user.id);
  redirect(next);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function startInvite(tokenValue: string, pin?: string) {
  const assignment = findAssignmentByToken(tokenValue);
  if (!assignment) return { error: "invite_invalid" };
  const q = getQuestionnaire(assignment.questionnaireId);
  if (!q || q.status !== "published") return { error: "survey_closed" };
  if (q.settings.requirePin && assignment.pin && assignment.pin !== pin) {
    return { error: "pin_wrong" };
  }
  if (assignment.status === "submitted") {
    const demo = tokenValue === "ai-demo" || tokenValue === "meal-demo" || isPublicEntryToken(tokenValue);
    if (!demo) return { error: "already_submitted" };
    mutate((data) => {
      const row = data.assignments.find((item) => item.id === assignment.id);
      if (!row) return;
      row.status = "pending";
      row.answers = {};
      row.respondentRole = null;
      row.staffAssisted = false;
      row.filledAt = null;
    });
  }
  mutate((data) => {
    const row = data.assignments.find((item) => item.id === assignment.id);
    if (row && row.status === "pending") row.status = "in_progress";
  });
  redirect(`/survey/${assignment.id}`);
}

export async function saveDraft(assignmentId: string, patch: Partial<AssignmentRecord> & { answers?: Answers }) {
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.status === "submitted") return { error: "cannot_save" };
  mutate((data) => {
    const row = data.assignments.find((item) => item.id === assignmentId);
    if (!row) return;
    if (patch.respondentRole !== undefined) row.respondentRole = patch.respondentRole;
    if (patch.anonymous !== undefined) row.anonymous = patch.anonymous;
    if (patch.staffAssisted !== undefined) row.staffAssisted = patch.staffAssisted;
    if (patch.filledAt !== undefined) row.filledAt = patch.filledAt;
    if (patch.answers) row.answers = { ...row.answers, ...patch.answers };
    if (row.status === "pending") row.status = "in_progress";
  });
  return { ok: true };
}

export async function submitSurvey(
  assignmentId: string,
  answers: Answers,
  header: {
    respondentRole: string | null;
    anonymous: boolean;
    staffAssisted: boolean;
    filledAt: string | null;
  },
  locale: Locale = "zh",
) {
  const assignment = getAssignment(assignmentId);
  if (!assignment || assignment.status === "submitted") return { error: "cannot_submit" };
  const q = getQuestionnaire(assignment.questionnaireId);
  if (!q) return { error: "survey_missing" };
  const errors = validateAnswers(q.schema, answers, locale);
  if (errors.length) return { error: errors[0].message, errors };
  const responseId = uid("rsp");
  mutate((data) => {
    const row = data.assignments.find((item) => item.id === assignmentId);
    if (!row) return;
    row.answers = answers;
    row.respondentRole = header.respondentRole;
    row.anonymous = header.anonymous;
    row.staffAssisted = header.staffAssisted;
    row.filledAt = header.filledAt ?? new Date().toISOString().slice(0, 10);
    row.status = "submitted";
    data.responses.push({
      id: responseId,
      assignmentId,
      questionnaireId: row.questionnaireId,
      answers,
      header: {
        respondentRole: row.respondentRole,
        anonymous: row.anonymous,
        staffAssisted: row.staffAssisted,
        filledAt: row.filledAt,
      },
      submittedAt: new Date().toISOString(),
    });
  });
  return { ok: true, responseId };
}

export async function createInvite(input: {
  questionnaireId: string;
  pin?: string;
  followUpOf?: string;
}) {
  await requireStaff();
  const q = getQuestionnaire(input.questionnaireId);
  if (!q || q.status !== "published") return { error: "只能为已发布问卷创建邀请" };
  const inviteToken = token();
  const assignment = mutate((data) => {
    const row: AssignmentRecord = {
      id: uid("asg"),
      questionnaireId: q.id,
      inviteToken,
      pin: input.pin?.trim() || null,
      status: "pending",
      respondentRole: null,
      anonymous: q.settings.anonymousDefault,
      staffAssisted: false,
      followUpOf: input.followUpOf || null,
      filledAt: null,
      answers: {},
      createdAt: new Date().toISOString(),
    };
    data.assignments.push(row);
    return row;
  });
  revalidatePath("/admin");
  return { ok: true, token: assignment.inviteToken, id: assignment.id };
}

function blankSchema(title: string): QuestionnaireSchema {
  return {
    id: uid("schema"),
    version: 1,
    title,
    intro: "",
    sections: [{ id: uid("sec"), title: "第一部分", questions: [] }],
  };
}

const defaultSettings = (): QuestionnaireSettings => ({
  anonymousDefault: true,
  allowStaffAssisted: true,
  requirePin: false,
});

export async function createQuestionnaire(title: string, duplicateFrom?: string) {
  await requireStaff();
  const source = duplicateFrom ? getQuestionnaire(duplicateFrom) : null;
  const created = mutate((data) => {
    const id = uid("qnr");
    const row: QuestionnaireRecord = {
      id,
      familyId: id,
      title: source ? `${source.title}（副本）` : title || "未命名问卷",
      intro: source?.intro ?? "",
      status: "draft",
      version: 1,
      schema: source
        ? { ...structuredClone(source.schema), id: uid("schema"), version: 1, title: `${source.schema.title}（副本）` }
        : blankSchema(title || "未命名问卷"),
      settings: source ? { ...source.settings } : defaultSettings(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.questionnaires.push(row);
    return row;
  });
  revalidatePath("/admin/questionnaires");
  redirect(`/admin/questionnaires/${created.id}`);
}

export async function saveQuestionnaire(id: string, patch: Partial<QuestionnaireRecord>) {
  await requireStaff();
  const current = getQuestionnaire(id);
  if (!current) return { error: "问卷不存在" };
  if (current.status === "published") {
    return { error: "已发布问卷不能直接改题，请先复制为新版本" };
  }
  if (patch.schema) {
    const errors = validateSchema(patch.schema);
    if (errors.length && patch.status === "published") return { error: errors[0] };
  }
  mutate((data) => {
    const row = data.questionnaires.find((item) => item.id === id);
    if (!row) return;
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.intro !== undefined) row.intro = patch.intro;
    if (patch.schema) {
      row.schema = patch.schema;
      row.schema.title = patch.title ?? row.title;
      row.schema.intro = patch.intro ?? row.intro;
    }
    if (patch.settings) row.settings = patch.settings;
    row.updatedAt = new Date().toISOString();
  });
  revalidatePath(`/admin/questionnaires/${id}`);
  return { ok: true };
}

export async function publishQuestionnaire(id: string) {
  await requireStaff();
  const current = getQuestionnaire(id);
  if (!current) return { error: "问卷不存在" };
  const errors = validateSchema(current.schema);
  if (errors.length) return { error: errors[0] };
  if (current.schema.sections.every((section) => section.questions.length === 0)) {
    return { error: "发布前请至少添加一道题" };
  }
  mutate((data) => {
    const row = data.questionnaires.find((item) => item.id === id);
    if (row) {
      row.status = "published";
      row.updatedAt = new Date().toISOString();
      if (!data.assignments.some((item) => item.questionnaireId === id)) {
        data.assignments.push({
          id: uid("asg"),
          questionnaireId: id,
          inviteToken: token(),
          pin: null,
          status: "pending",
          respondentRole: null,
          anonymous: row.settings.anonymousDefault,
          staffAssisted: false,
          followUpOf: null,
          filledAt: null,
          answers: {},
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
  revalidatePath("/");
  revalidatePath("/admin/questionnaires");
  return { ok: true };
}

export async function cloneNewVersion(id: string) {
  await requireStaff();
  const current = getQuestionnaire(id);
  if (!current) return { error: "问卷不存在" };
  const created = mutate((data) => {
    const next: QuestionnaireRecord = {
      ...structuredClone(current),
      id: uid("qnr"),
      status: "draft",
      version: current.version + 1,
      schema: { ...structuredClone(current.schema), version: current.version + 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.questionnaires.push(next);
    return next;
  });
  redirect(`/admin/questionnaires/${created.id}`);
}

export async function archiveQuestionnaire(id: string) {
  await requireStaff();
  mutate((data) => {
    const row = data.questionnaires.find((item) => item.id === id);
    if (row) {
      row.status = "archived";
      row.updatedAt = new Date().toISOString();
    }
  });
  revalidatePath("/admin/questionnaires");
  return { ok: true };
}

export async function saveStories(formData: FormData) {
  await requireStaff();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "内容无效" };
  }
  const parsed = parseStoriesPack(raw);
  if (!parsed.ok) return { error: parsed.error };
  mutate((data) => {
    data.stories = parsed.pack;
  });
  revalidatePath("/");
  revalidatePath("/admin/stories");
  return { ok: true };
}

export async function uploadStoryPhoto(formData: FormData) {
  await requireStaff();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "请选择一张照片" };
  if (file.size > 8 * 1024 * 1024) return { error: "照片请小于 8MB" };
  const match = file.name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/);
  if (!match) return { error: "请上传 jpg、png、webp 或 gif" };
  const label = String(formData.get("label") ?? "").trim() || file.name.replace(/\.[^.]+$/, "");
  const filename = `${uid("story")}${match[0]}`;
  const dir = path.join(process.cwd(), "public", "photos", "stories");
  mkdirSync(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(dir, filename), buffer);
  const photo = {
    id: uid("pic"),
    src: `/photos/stories/${filename}`,
    label,
  };
  mutate((data) => {
    data.storyPhotos.push(photo);
  });
  revalidatePath("/");
  revalidatePath("/admin/stories");
  return { ok: true, photo };
}

export async function createStaffUser(formData: FormData) {
  const me = await requireStaff();
  if (me.role !== "admin") return { error: "仅管理员可添加工作人员" };
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !name || password.length < 6) return { error: "请填写姓名、账号和至少6位密码" };
  mutate((data) => {
    if (data.users.some((user) => user.email === email)) return;
    const salt = makeSalt();
    data.users.push({
      id: uid("user"),
      email,
      name,
      role: "staff",
      passwordSalt: salt,
      passwordHash: hashPassword(password, salt),
    });
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function adminSnapshot() {
  await requireStaff();
  const questionnaires = listQuestionnaires();
  return {
    questionnaires,
    assignments: listAssignments(),
    responses: listResponses(),
    counts: Object.fromEntries(questionnaires.map((item) => [item.id, countResponsesFor(item.id)])),
    store: getStore(),
  };
}
