export type QuestionType = "single" | "multi" | "matrix" | "longtext";

export type Option = {
  value: string;
  label: string;
};

export type ShowIf = {
  questionId: string;
  equals: string | string[];
};

export type Question = {
  id: string;
  type: QuestionType;
  title: string;
  help?: string;
  required?: boolean;
  options?: Option[];
  allowOther?: boolean;
  maxSelect?: number;
  rows?: Option[];
  scale?: Option[];
  showIf?: ShowIf;
};

export type Section = {
  id: string;
  title: string;
  questions: Question[];
};

export type QuestionnaireSchema = {
  id: string;
  version: number;
  title: string;
  intro?: string;
  sections: Section[];
};

export type Answers = Record<string, unknown>;

export type SingleAnswer = { value: string; other?: string };
export type MultiAnswer = { values: string[]; other?: string };
export type MatrixAnswer = { cells: Record<string, string>; note?: string };

export type QuestionnaireStatus = "draft" | "published" | "archived";
export type AssignmentStatus = "pending" | "in_progress" | "submitted";
export type StaffRole = "staff" | "admin";

export type QuestionnaireSettings = {
  anonymousDefault: boolean;
  allowStaffAssisted: boolean;
  requirePin: boolean;
};

export type QuestionnaireRecord = {
  id: string;
  familyId: string;
  title: string;
  intro: string;
  status: QuestionnaireStatus;
  version: number;
  schema: QuestionnaireSchema;
  settings: QuestionnaireSettings;
  createdAt: string;
  updatedAt: string;
};

export type AssignmentRecord = {
  id: string;
  questionnaireId: string;
  inviteToken: string;
  pin: string | null;
  status: AssignmentStatus;
  respondentRole: string | null;
  anonymous: boolean;
  staffAssisted: boolean;
  followUpOf: string | null;
  filledAt: string | null;
  answers: Answers;
  createdAt: string;
};

export type ResponseRecord = {
  id: string;
  assignmentId: string;
  questionnaireId: string;
  answers: Answers;
  header: {
    respondentRole: string | null;
    anonymous: boolean;
    staffAssisted: boolean;
    filledAt: string | null;
  };
  submittedAt: string;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  name: string;
  role: StaffRole;
};
