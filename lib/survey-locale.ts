import type { Locale } from "./i18n";
import type { Option, Question, QuestionnaireRecord, QuestionnaireSchema, Section } from "./survey-engine/types";

type Pack = {
  title: string;
  intro: string;
  sections: Record<string, string>;
  questions: Record<string, string>;
  options: Record<string, string>;
};

const aiDemandEn: Pack = {
  title: "Needs survey for high-end AI elderly care",
  intro:
    "Hello. This survey asks how elders and families feel about intelligent care, AI care devices, and high-end care services. It is anonymous by default. There are no right or wrong answers. Please tick or write what is true for you. Open questions have room to write. Thank you for your support.",
  sections: {
    basic: "1. About you",
    awareness: "2. Knowing and using intelligent care",
    demand: "3. What high-end AI care should offer",
    improve: "4. What could be better",
    overall: "5. Overall view",
  },
  questions: {
    q1: "Who are you?",
    q2: "Which age group are you in?",
    q3: "How do you live and receive care now?",
    q4: "Do you need help with daily living?",
    q5: "Have you used intelligent care devices, such as a band, fall alert, health bed, or AI call button?",
    q6: "Can AI devices make care feel safer and easier?",
    q7: "Which problems should intelligent devices help with most?",
    q8: "If the home offered these AI care services, which would interest you most?",
    q9: "What matters most in high-end elderly care?",
    q10: "What worries you most about AI devices in a care home?",
    q11: "Would you try letting AI or a robot help with some care?",
    q12: "If AI care cost extra, what monthly fee would feel acceptable?",
    q13: "What in care homes or care services most needs to improve?",
    q14: "What services or devices would you like the home to add?",
    q15: "When elders use intelligent devices, what help do they need most?",
    q16: "May a student later have a short talk with you about how this felt?",
    q16_contact: "If yes, you may leave a name or a way to reach you. This is optional.",
    q17: "Overall, how do you feel about AI intelligent care?",
    q18: "In one sentence, what would an ideal later life feel like?",
  },
  options: {
    "q1:elder": "The elder",
    "q1:family": "A family member",
    "q1:staff": "A staff member",
    "q1:other": "Someone else",
    "q2:under60": "Under 60",
    "q2:60s": "60–69",
    "q2:70s": "70–79",
    "q2:80plus": "80 or older",
    "q3:home": "Living at home",
    "q3:facility": "A care home or nursing home",
    "q3:children": "Living with children",
    "q3:daycare": "Community day care",
    "q3:other": "Other",
    "q4:rarely": "Almost never",
    "q4:sometimes": "Sometimes",
    "q4:often": "Often",
    "q4:mostly": "Most of the time",
    "q5:often": "I use them often",
    "q5:sometimes": "I use them sometimes",
    "q5:heard": "I have heard of them but not used them",
    "q5:never": "I have never used them",
    "q6:very": "Very helpful",
    "q6:some": "Somewhat helpful",
    "q6:unsure": "Not sure / no strong feeling",
    "q6:distrust": "I do not quite trust them",
    "q6:none": "I do not need them at all",
    "q7:fall": "Alerts for falls, leaving bed, or sudden trouble",
    "q7:vitals": "Health checks such as heart rate, blood pressure, and sleep",
    "q7:meds": "Medicine reminders",
    "q7:sos": "Calling family or nurses in an emergency",
    "q7:companion": "Company, talk, and simple play",
    "q7:delivery": "Help bringing meals, medicine, or things",
    "q7:doctor": "Help reaching a doctor or a video visit",
    "q7:other": "Other",
    "q8:monitor24": "24-hour AI safety watch",
    "q8:healthdata": "AI health records and review",
    "q8:voice": "Voice company and gentle emotional care",
    "q8:remind": "Medicine and care reminders",
    "q8:robot": "A robot that brings meals or things",
    "q8:rehab": "Help with rehabilitation exercises",
    "q8:remote": "Family can see health and daily life from afar",
    "q8:personal": "Personal advice on meals, movement, and care",
    "q8:room": "A smart room for lights, warmth, and calling",
    "q8:other": "Other",
    "q9:medical": "Skilled medical and nursing care",
    "q9:env": "A quiet, comfortable place",
    "q9:staff": "Patient, responsible staff",
    "q9:food": "Healthy, nourishing meals",
    "q9:safety": "Strong safety",
    "q9:activity": "Plenty of activities",
    "q9:family": "Easy contact with family",
    "q9:dignity": "Privacy and dignity",
    "q9:tech": "Advanced tools that are still easy to use",
    "q9:price": "Clear, fair prices",
    "q10:hard": "Too hard to use",
    "q10:privacy": "Worry about privacy",
    "q10:error": "Worry the device is wrong or fails",
    "q10:lonely": "Worry it replaces human company",
    "q10:cost": "Too expensive",
    "q10:maintain": "Hard to repair and look after",
    "q10:none": "No strong worry",
    "q10:other": "Other",
    "q11:very": "Very willing",
    "q11:try": "Willing to try",
    "q11:depends": "Not sure — it depends on the service",
    "q11:reluctant": "Not very willing",
    "q11:no": "Not willing at all",
    "q12:none": "I would not pay extra",
    "q12:lt500": "Under 500 yuan",
    "q12:500_1000": "500–1,000 yuan",
    "q12:1000_3000": "1,000–3,000 yuan",
    "q12:gt3000": "More than 3,000 yuan",
    "q12:depends": "It depends on what is offered",
    "q13:staffing": "Not enough care staff",
    "q13:medical": "Not enough medical support",
    "q13:emergency": "Slow response in an emergency",
    "q13:company": "Too little activity and company",
    "q13:meals": "Limited meal choices",
    "q13:room": "Rooms that are not easy to use",
    "q13:family": "Slow contact with family",
    "q13:fee": "Fees that feel high",
    "q13:other": "Other",
    "q16:yes": "Yes",
    "q16:no": "No",
    "q16:maybe": "Yes, if you explain first and ask my consent",
    "q17:eager": "I look forward to it",
    "q17:support": "I mostly support it",
    "q17:watch": "I am watching and waiting",
    "q17:low": "I do not quite support it",
    "q17:no": "I do not support it at all",
  },
};

const mealFollowupEn: Pack = {
  title: "Follow-up on meals and dining",
  intro:
    "Hello. In the last survey on AI intelligent care, many elders did not want to pay extra for AI, and some said meals could be better. This is a short follow-up about food, dining, and small improvements that do not add a personal fee. It is anonymous. There are no right or wrong answers. You may skip what you do not wish to answer.",
  sections: {
    basic: "1. A little about you (optional)",
    experience: "2. Meals and dining",
    ai: "3. A follow-up from the AI care survey",
    open: "4. Open thoughts (please be as specific as you can)",
  },
  questions: {
    m1: "How old are you?",
    m2: "How long have you lived here or used the home's care?",
    m3: "Do you have special diet needs?",
    m4: "From how it really feels, how would you rate these?",
    m4_note: "You may add a note, such as which meal, which dish, or a recent time.",
    m5: "What about meals most needs to improve? Choose up to 3.",
    m6: "If the budget stays about the same and elders are not charged extra, which small changes would help most? Choose up to 3.",
    m7: "Last time, many elders did not want to pay extra for AI. For meals, which feels more acceptable?",
    m8: "If it cost you nothing extra, how could AI or a smart system help with meals?",
    m9: "Which dish or kind of meal do you like most here, and why?",
    m10: "If cost stays similar and you pay no extra fee, what one meal change do you want most?",
    m11: "Any other thoughts on meals, dining, or daily care?",
  },
  options: {
    "m1:60s": "60–69",
    "m1:70s": "70–79",
    "m1:80plus": "80 or older",
    "m1:skip": "I would rather not say",
    "m2:lt3m": "Less than 3 months",
    "m2:3m1y": "3 months to 1 year",
    "m2:1to3": "1–3 years",
    "m2:gt3": "More than 3 years",
    "m3:none": "No",
    "m3:less": "Less salt, oil, or sugar",
    "m3:soft": "Soft food / easy to chew",
    "m3:medical": "A diet for diabetes, blood pressure, or similar",
    "m3:light": "Light food",
    "m3:other": "Other",
    "m4:very": "Very satisfied",
    "m4:ok": "Quite all right",
    "m4:mid": "So-so",
    "m4:low": "Not very satisfied",
    "m4:bad": "Not satisfied",
    "m4:taste": "Taste",
    "m4:fresh": "Freshness",
    "m4:balance": "Meat and vegetables / balanced nutrition",
    "m4:texture": "How soft or firm the food is",
    "m4:temp": "Temperature",
    "m4:portion": "Portion size",
    "m4:variety": "Variety and choice",
    "m4:service": "Dining room and service",
    "m5:taste": "Better taste",
    "m5:variety": "More variety",
    "m5:fresh": "Fresher food",
    "m5:balance": "Better balance of meat and vegetables",
    "m5:less": "Less oil, salt, and sugar",
    "m5:soft": "Softer food that is easier to chew",
    "m5:temp": "A better temperature",
    "m5:portion": "A better portion size",
    "m5:fruit": "More fruit, soup, or a small sweet",
    "m5:menu": "The menu shared in advance",
    "m5:choice": "A choice between meal A and meal B",
    "m5:other": "Other",
    "m6:weekly": "Change the menu each week, with less repetition",
    "m6:veg": "Use more seasonal vegetables and common ingredients",
    "m6:bland": "Add one light, soft dish",
    "m6:feedback": "Ask elders once a week how meals felt",
    "m6:choice": "Choose one of two dishes at lunch or dinner",
    "m6:label": "Label dishes such as low-salt, soft, or with sugar",
    "m6:warm": "Keep food warm after it is served",
    "m6:box": "A comment book or a suggestion box",
    "m6:health": "Adjust meals to health needs",
    "m6:staff": "Staff write down dishes someone dislikes",
    "m6:other": "Other",
    "m7:no_fee": "No extra fee — only improve what is already here",
    "m7:unified": "I would try it if the home provides it for everyone",
    "m7:if_better": "Only if meals clearly get better",
    "m7:human": "I do not need AI. Human care matters more",
    "m7:unsure": "I am not sure",
    "m8:taste": "Remember personal tastes",
    "m8:salt": "Remind about less salt or sugar",
    "m8:family": "Let family see the daily menu",
    "m8:feedback": "Collect how meals felt",
    "m8:recommend": "Suggest meals based on health",
    "m8:water": "Remind about meals or drinking water",
    "m8:none": "I do not need AI for this",
    "m8:other": "Other",
  },
};

const packs: Record<string, Pack> = {
  "ai-demand": aiDemandEn,
  "meal-followup": mealFollowupEn,
};

function packFor(schema: QuestionnaireSchema): Pack | undefined {
  if (packs[schema.id]) return packs[schema.id];
  if (schema.title.includes("餐食") || schema.title.includes("伙食")) return mealFollowupEn;
  if (schema.title.includes("AI") || schema.title.includes("智慧")) return aiDemandEn;
  return undefined;
}

function locOption(questionId: string, option: Option, pack: Pack): Option {
  const en = pack.options[`${questionId}:${option.value}`];
  return en ? { ...option, label: en } : option;
}

function locQuestion(question: Question, pack: Pack): Question {
  return {
    ...question,
    title: pack.questions[question.id] ?? question.title,
    options: question.options?.map((option) => locOption(question.id, option, pack)),
    rows: question.rows?.map((row) => locOption(question.id, row, pack)),
    scale: question.scale?.map((item) => locOption(question.id, item, pack)),
  };
}

function locSection(section: Section, pack: Pack): Section {
  return {
    ...section,
    title: pack.sections[section.id] ?? section.title,
    questions: section.questions.map((question) => locQuestion(question, pack)),
  };
}

export function localizeSchema(schema: QuestionnaireSchema, locale: Locale): QuestionnaireSchema {
  if (locale !== "en") return schema;
  const pack = packFor(schema);
  if (!pack) return schema;
  return {
    ...schema,
    title: pack.title,
    intro: pack.intro,
    sections: schema.sections.map((section) => locSection(section, pack)),
  };
}

export function localizeQuestionnaire(questionnaire: QuestionnaireRecord, locale: Locale): QuestionnaireRecord {
  const schema = localizeSchema(questionnaire.schema, locale);
  return {
    ...questionnaire,
    title: schema.title,
    intro: schema.intro ?? questionnaire.intro,
    schema,
  };
}

export function surveyHeading(title: string, locale: Locale) {
  if (locale === "zh") return title;
  if (title.includes("餐食") || title.includes("伙食") || /meal|dining/i.test(title)) return mealFollowupEn.title;
  if (title.includes("AI") || title.includes("智慧") || /care|ai/i.test(title)) return aiDemandEn.title;
  return title;
}

export function surveyIntro(title: string, intro: string, locale: Locale) {
  if (locale !== "en") return intro;
  if (title.includes("餐食") || title.includes("伙食") || /meal|dining/i.test(title)) return mealFollowupEn.intro;
  if (title.includes("AI") || title.includes("智慧") || /care|ai/i.test(title)) return aiDemandEn.intro;
  return intro;
}
