import type { QuestionnaireSchema } from "@/lib/survey-engine/types";

const o = (value: string, label: string) => ({ value, label });

const likert = [
  o("very", "Very satisfied"),
  o("ok", "Quite all right"),
  o("mid", "So-so"),
  o("low", "Not very satisfied"),
  o("bad", "Not satisfied"),
];

export const mealFollowupSchema: QuestionnaireSchema = {
  id: "meal-followup",
  version: 1,
  title: "Follow-up on meals and dining",
  intro:
    "Hello. In the last survey on AI intelligent care, many elders did not want to pay extra for AI, and some said meals could be better. This is a short follow-up about food, dining, and small improvements that do not add a personal fee. It is anonymous. There are no right or wrong answers. You may skip what you do not wish to answer.",
  sections: [
    {
      id: "basic",
      title: "1. A little about you (optional)",
      questions: [
        {
          id: "m1",
          type: "single",
          title: "How old are you?",
          options: [
            o("60s", "60–69"),
            o("70s", "70–79"),
            o("80plus", "80 or older"),
            o("skip", "I would rather not say"),
          ],
        },
        {
          id: "m2",
          type: "single",
          title: "How long have you lived here or used the home's care?",
          options: [
            o("lt3m", "Less than 3 months"),
            o("3m1y", "3 months to 1 year"),
            o("1to3", "1–3 years"),
            o("gt3", "More than 3 years"),
          ],
        },
        {
          id: "m3",
          type: "single",
          title: "Do you have special diet needs?",
          allowOther: true,
          options: [
            o("none", "No"),
            o("less", "Less salt, oil, or sugar"),
            o("soft", "Soft food / easy to chew"),
            o("medical", "A diet for diabetes, blood pressure, or similar"),
            o("light", "Light food"),
            o("other", "Other"),
          ],
        },
      ],
    },
    {
      id: "experience",
      title: "2. Meals and dining",
      questions: [
        {
          id: "m4",
          type: "matrix",
          title: "From how it really feels, how would you rate these?",
          required: true,
          scale: likert,
          rows: [
            o("taste", "Taste"),
            o("fresh", "Freshness"),
            o("balance", "Meat and vegetables / balanced nutrition"),
            o("texture", "How soft or firm the food is"),
            o("temp", "Temperature"),
            o("portion", "Portion size"),
            o("variety", "Variety and choice"),
            o("service", "Dining room and service"),
          ],
        },
        {
          id: "m4_note",
          type: "longtext",
          title: "You may add a note, such as which meal, which dish, or a recent time.",
        },
        {
          id: "m5",
          type: "multi",
          title: "What about meals most needs to improve? Choose up to 3.",
          required: true,
          maxSelect: 3,
          allowOther: true,
          options: [
            o("taste", "Better taste"),
            o("variety", "More variety"),
            o("fresh", "Fresher food"),
            o("balance", "Better balance of meat and vegetables"),
            o("less", "Less oil, salt, and sugar"),
            o("soft", "Softer food that is easier to chew"),
            o("temp", "A better temperature"),
            o("portion", "A better portion size"),
            o("fruit", "More fruit, soup, or a small sweet"),
            o("menu", "The menu shared in advance"),
            o("choice", "A choice between meal A and meal B"),
            o("other", "Other"),
          ],
        },
        {
          id: "m6",
          type: "multi",
          title: "If the budget stays about the same and elders are not charged extra, which small changes would help most? Choose up to 3.",
          required: true,
          maxSelect: 3,
          allowOther: true,
          options: [
            o("weekly", "Change the menu each week, with less repetition"),
            o("veg", "Use more seasonal vegetables and common ingredients"),
            o("bland", "Add one light, soft dish"),
            o("feedback", "Ask elders once a week how meals felt"),
            o("choice", "Choose one of two dishes at lunch or dinner"),
            o("label", "Label dishes such as low-salt, soft, or with sugar"),
            o("warm", "Keep food warm after it is served"),
            o("box", "A comment book or a suggestion box"),
            o("health", "Adjust meals to health needs"),
            o("staff", "Staff write down dishes someone dislikes"),
            o("other", "Other"),
          ],
        },
      ],
    },
    {
      id: "ai",
      title: "3. A follow-up from the AI care survey",
      questions: [
        {
          id: "m7",
          type: "single",
          title: "Last time, many elders did not want to pay extra for AI. For meals, which feels more acceptable?",
          required: true,
          options: [
            o("no_fee", "No extra fee — only improve what is already here"),
            o("unified", "I would try it if the home provides it for everyone"),
            o("if_better", "Only if meals clearly get better"),
            o("human", "I do not need AI. Human care matters more"),
            o("unsure", "I am not sure"),
          ],
        },
        {
          id: "m8",
          type: "multi",
          title: "If it cost you nothing extra, how could AI or a smart system help with meals?",
          required: true,
          allowOther: true,
          options: [
            o("taste", "Remember personal tastes"),
            o("salt", "Remind about less salt or sugar"),
            o("family", "Let family see the daily menu"),
            o("feedback", "Collect how meals felt"),
            o("recommend", "Suggest meals based on health"),
            o("water", "Remind about meals or drinking water"),
            o("none", "I do not need AI for this"),
            o("other", "Other"),
          ],
        },
      ],
    },
    {
      id: "open",
      title: "4. Open thoughts (please be as specific as you can)",
      questions: [
        {
          id: "m9",
          type: "longtext",
          title: "Which dish or kind of meal do you like most here, and why?",
        },
        {
          id: "m10",
          type: "longtext",
          title: "If cost stays similar and you pay no extra fee, what one meal change do you want most?",
        },
        {
          id: "m11",
          type: "longtext",
          title: "Any other thoughts on meals, dining, or daily care?",
        },
      ],
    },
  ],
};
