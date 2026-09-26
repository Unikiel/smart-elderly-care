import { accessSync, constants, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { aiDemandSchema } from "@/questionnaires/ai-demand";
import { mealFollowupSchema } from "@/questionnaires/meal-followup";
import { hashPassword, makeSalt } from "./auth-hash";
import { token, uid } from "./ids";
import { asStoriesPack, defaultStories, defaultStoriesPack, isStoriesPack, type StoriesPack, type StoryPhoto } from "./stories";
import { localizeQuestionnaire } from "./survey-locale";
import type {
  AssignmentRecord,
  QuestionnaireRecord,
  ResponseRecord,
  UserRecord,
} from "./survey-engine/types";

export type StoreUser = UserRecord;

export const SEED_ADMIN_LOGIN = "admin";
export const SEED_ADMIN_PASSWORD = "changeit";

export type StoreData = {
  users: UserRecord[];
  questionnaires: QuestionnaireRecord[];
  assignments: AssignmentRecord[];
  responses: ResponseRecord[];
  stories: StoriesPack;
  storyPhotos: StoryPhoto[];
};

let dataFile = path.join(process.cwd(), "data", "store.json");

function writableStoreFile() {
  const dir = path.dirname(dataFile);
  try {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    accessSync(dir, constants.W_OK);
    return dataFile;
  } catch {
    const fallback = path.join(tmpdir(), "smart-elderly-care");
    mkdirSync(fallback, { recursive: true });
    dataFile = path.join(fallback, "store.json");
    return dataFile;
  }
}

let cache: StoreData | null = null;

function now() {
  return new Date().toISOString();
}

function seedQuestionnaire(
  familyId: string,
  title: string,
  intro: string,
  schema: QuestionnaireRecord["schema"],
): QuestionnaireRecord {
  const createdAt = now();
  return {
    id: familyId,
    familyId,
    title,
    intro,
    status: "published",
    version: 1,
    schema: { ...schema, title, intro },
    settings: {
      anonymousDefault: true,
      allowStaffAssisted: true,
      requirePin: false,
    },
    createdAt,
    updatedAt: createdAt,
  };
}

function seedAssignment(questionnaireId: string, inviteToken: string): AssignmentRecord {
  return {
    id: uid("asg"),
    questionnaireId,
    inviteToken,
    pin: null,
    status: "pending",
    respondentRole: null,
    anonymous: true,
    staffAssisted: false,
    followUpOf: null,
    filledAt: null,
    answers: {},
    createdAt: now(),
  };
}

function seedAdmin(): UserRecord {
  const salt = makeSalt();
  return {
    id: "user_admin",
    email: SEED_ADMIN_LOGIN,
    passwordSalt: salt,
    passwordHash: hashPassword(SEED_ADMIN_PASSWORD, salt),
    name: "Admin",
    role: "admin",
  };
}

function emptyStore(): StoreData {
  const admin = seedAdmin();
  const ai = seedQuestionnaire(
    "qnr_ai_demand",
    aiDemandSchema.title,
    aiDemandSchema.intro ?? "",
    aiDemandSchema,
  );
  const meal = seedQuestionnaire(
    "qnr_meal_followup",
    mealFollowupSchema.title,
    mealFollowupSchema.intro ?? "",
    mealFollowupSchema,
  );
  return {
    users: [admin],
    questionnaires: [ai, meal],
    assignments: [seedAssignment(ai.id, "ai-demo"), seedAssignment(meal.id, "meal-demo")],
    responses: [],
    stories: defaultStoriesPack(),
    storyPhotos: [],
  };
}

function migrate(data: StoreData) {
  let dirty = false;
  if (!isStoriesPack(data.stories) || !data.stories.en?.feelings?.length || !data.stories.zh?.feelings?.length) {
    data.stories = asStoriesPack(data.stories);
    dirty = true;
  }
  if (!Array.isArray(data.storyPhotos)) {
    data.storyPhotos = [];
    dirty = true;
  }

  const cjk = /[\u4e00-\u9fff]/;
  for (const questionnaire of data.questionnaires) {
    const blob = `${questionnaire.title}\n${questionnaire.intro}\n${JSON.stringify(questionnaire.schema)}`;
    if (!cjk.test(blob)) continue;
    const next = localizeQuestionnaire(questionnaire, "en");
    if (cjk.test(next.title) && cjk.test(questionnaire.title)) continue;
    questionnaire.title = next.title;
    questionnaire.intro = next.intro ?? questionnaire.intro;
    questionnaire.schema = next.schema;
    dirty = true;
  }

  if (cjk.test(JSON.stringify(data.stories ?? ""))) {
    const english =
      data.stories?.en && !cjk.test(JSON.stringify(data.stories.en)) ? data.stories.en : defaultStories();
    data.stories = { zh: english, en: english };
    dirty = true;
  }

  for (const user of data.users) {
    if (!cjk.test(user.name)) continue;
    user.name = user.role === "admin" ? "Admin" : "Staff";
    dirty = true;
  }
  for (const photo of data.storyPhotos) {
    if (!cjk.test(photo.label)) continue;
    photo.label = "Photo";
    dirty = true;
  }

  const admin =
    data.users.find((user) => user.id === "user_admin") ??
    data.users.find((user) => user.email === SEED_ADMIN_LOGIN) ??
    data.users.find((user) => user.email === "admin@local.test");

  if (!admin) {
    data.users.unshift(seedAdmin());
    dirty = true;
  } else if (admin.email !== SEED_ADMIN_LOGIN) {
    const next = seedAdmin();
    admin.email = next.email;
    admin.passwordSalt = next.passwordSalt;
    admin.passwordHash = next.passwordHash;
    admin.role = "admin";
    admin.name = admin.name || next.name;
    dirty = true;
  }

  return dirty;
}

function read(): StoreData {
  if (cache) return cache;
  const file = writableStoreFile();
  if (!existsSync(file)) {
    cache = emptyStore();
    persist(cache);
    return cache;
  }
  cache = JSON.parse(readFileSync(file, "utf8")) as StoreData;
  if (migrate(cache)) persist(cache);
  return cache;
}

function persist(data: StoreData) {
  cache = data;
  const file = writableStoreFile();
  writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

export function mutate<T>(fn: (data: StoreData) => T): T {
  const data = read();
  const result = fn(data);
  persist(data);
  return result;
}

export function getStore() {
  return read();
}

export function findUserById(id: string) {
  return read().users.find((user) => user.id === id) ?? null;
}

export function findUserByEmail(email: string) {
  return read().users.find((user) => user.email === email) ?? null;
}

export function getStoriesPack(): StoriesPack {
  return asStoriesPack(read().stories);
}

export function getStories() {
  const pack = getStoriesPack();
  if (pack.en.feelings.length > 0) return pack.en;
  return pack.zh;
}

export function listStoryPhotos() {
  return read().storyPhotos ?? [];
}

export function listQuestionnaires() {
  return [...read().questionnaires].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getQuestionnaire(id: string) {
  return read().questionnaires.find((item) => item.id === id) ?? null;
}

export function listPublished() {
  return read().questionnaires.filter((item) => item.status === "published");
}

export function findAssignmentByToken(inviteToken: string) {
  return read().assignments.find((item) => item.inviteToken === inviteToken) ?? null;
}

export function getAssignment(id: string) {
  return read().assignments.find((item) => item.id === id) ?? null;
}

export function listAssignments() {
  return [...read().assignments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getResponse(id: string) {
  return read().responses.find((item) => item.id === id) ?? null;
}

export function getResponseByAssignment(assignmentId: string) {
  return read().responses.find((item) => item.assignmentId === assignmentId) ?? null;
}

export function listResponses() {
  return [...read().responses].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export function countResponsesFor(questionnaireId: string) {
  return read().responses.filter((item) => item.questionnaireId === questionnaireId).length;
}

export type FrontSurvey = {
  id: string;
  title: string;
  intro: string;
  token: string;
  questionCount: number;
  tag: string;
};

export function listFrontSurveys(): FrontSurvey[] {
  return mutate((data) =>
    data.questionnaires
      .filter((item) => item.status === "published")
      .map((item) => {
        const siblings = data.assignments
          .filter((row) => row.questionnaireId === item.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        let entry = siblings[0];
        if (!entry) {
          entry = seedAssignment(item.id, token());
          data.assignments.push(entry);
        }
        const questionCount = item.schema.sections.reduce(
          (sum, section) => sum + section.questions.length,
          0,
        );
        const tag = /meal|dining|餐食|伙食/i.test(item.title)
          ? "Follow-up"
          : /AI|智慧|elderly care/i.test(item.title)
            ? "Care survey"
            : "Open survey";
        return {
          id: item.id,
          title: item.title,
          intro: item.intro,
          token: entry.inviteToken,
          questionCount,
          tag,
        };
      }),
  );
}

export function isPublicEntryToken(inviteToken: string) {
  const assignment = findAssignmentByToken(inviteToken);
  if (!assignment) return false;
  const first = read()
    .assignments.filter((row) => row.questionnaireId === assignment.questionnaireId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  return first?.id === assignment.id;
}

export function resetCache() {
  cache = null;
}

export { token, uid };
