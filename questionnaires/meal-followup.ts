import type { QuestionnaireSchema } from "@/lib/survey-engine/types";

const o = (value: string, label: string) => ({ value, label });

const likert = [
  o("very", "很满意"),
  o("ok", "还可以"),
  o("mid", "一般"),
  o("low", "不太满意"),
  o("bad", "不满意"),
];

export const mealFollowupSchema: QuestionnaireSchema = {
  id: "meal-followup",
  version: 1,
  title: "养老院餐食与伙食改进追访问卷",
  intro:
    "尊敬的长者：您好！上一次关于“AI智慧养老服务”的问卷中，我们了解到很多长者不希望额外付费使用AI服务，也有长者提出养老院餐食方面还有提升空间。本问卷是一次简短追访，主要想了解大家对饭菜、用餐体验以及在预算相近、不额外增加个人负担的情况下可以如何改进。问卷匿名填写，答案没有对错，您可以只填写愿意回答的部分。",
  sections: [
    {
      id: "basic",
      title: "一、基本情况（可选填写）",
      questions: [
        {
          id: "m1",
          type: "single",
          title: "您的年龄？",
          options: [
            o("60s", "60–69岁"),
            o("70s", "70–79岁"),
            o("80plus", "80岁及以上"),
            o("skip", "不方便透露"),
          ],
        },
        {
          id: "m2",
          type: "single",
          title: "您在养老院居住/接触养老院服务的时间？",
          options: [
            o("lt3m", "少于3个月"),
            o("3m1y", "3个月–1年"),
            o("1to3", "1–3年"),
            o("gt3", "3年以上"),
          ],
        },
        {
          id: "m3",
          type: "single",
          title: "您是否有特殊饮食需求？",
          allowOther: true,
          options: [
            o("none", "没有"),
            o("less", "少盐/少油/少糖"),
            o("soft", "软食/易咀嚼"),
            o("medical", "糖尿病/高血压等饮食控制"),
            o("light", "清淡饮食"),
            o("other", "其他"),
          ],
        },
      ],
    },
    {
      id: "experience",
      title: "二、餐食与用餐体验",
      questions: [
        {
          id: "m4",
          type: "matrix",
          title: "请您根据实际感受，为下列项目选择评价",
          required: true,
          scale: likert,
          rows: [
            o("taste", "饭菜味道"),
            o("fresh", "菜品新鲜度"),
            o("balance", "荤素搭配/营养均衡"),
            o("texture", "饭菜软硬程度"),
            o("temp", "饭菜温度"),
            o("portion", "分量是否合适"),
            o("variety", "菜品变化和选择"),
            o("service", "用餐环境与服务"),
          ],
        },
        {
          id: "m4_note",
          type: "longtext",
          title: "可补充说明（例如：哪一餐、哪一道菜、最近一次经历）",
        },
        {
          id: "m5",
          type: "multi",
          title: "您觉得目前最需要改进的餐食方面是什么？（最多选3项）",
          required: true,
          maxSelect: 3,
          allowOther: true,
          options: [
            o("taste", "味道更好一些"),
            o("variety", "菜品变化更多"),
            o("fresh", "饭菜更新鲜"),
            o("balance", "荤素搭配更合理"),
            o("less", "少油、少盐、少糖"),
            o("soft", "饭菜更软、更容易咀嚼"),
            o("temp", "饭菜温度更合适"),
            o("portion", "分量更合适"),
            o("fruit", "增加水果/汤/点心"),
            o("menu", "提前公布菜单"),
            o("choice", "可以选择A/B餐"),
            o("other", "其他"),
          ],
        },
        {
          id: "m6",
          type: "multi",
          title: "如果预算大致不变、不额外向长者收费，您觉得哪些小改变最有帮助？（最多选3项）",
          required: true,
          maxSelect: 3,
          allowOther: true,
          options: [
            o("weekly", "每周更换菜单，减少重复菜"),
            o("veg", "多用当季蔬菜和常见食材"),
            o("bland", "增加一道清淡软烂菜"),
            o("feedback", "每周收集一次长者意见"),
            o("choice", "午餐或晚餐可二选一"),
            o("label", "标注“少盐/软食/含糖”等信息"),
            o("warm", "饭菜出餐后尽量保温"),
            o("box", "设置意见本或意见箱"),
            o("health", "根据长者健康情况调整餐食"),
            o("staff", "工作人员帮助记录不喜欢的菜"),
            o("other", "其他"),
          ],
        },
      ],
    },
    {
      id: "ai",
      title: "三、与上一份AI智慧养老问卷相关的追问",
      questions: [
        {
          id: "m7",
          type: "single",
          title: "上次问卷中，很多长者表示不希望为AI服务额外付费。关于餐食方面，您更能接受哪种方式？",
          required: true,
          options: [
            o("no_fee", "不额外收费，只在现有服务中改进"),
            o("unified", "如果养老院统一提供，可以尝试"),
            o("if_better", "只有明显改善餐食时才考虑"),
            o("human", "不需要AI，人工服务更重要"),
            o("unsure", "说不清楚"),
          ],
        },
        {
          id: "m8",
          type: "multi",
          title: "如果不需要您额外付费，您觉得AI或智能系统在餐食方面可以做什么？",
          required: true,
          allowOther: true,
          options: [
            o("taste", "记录个人口味偏好"),
            o("salt", "提醒少盐/少糖等健康饮食"),
            o("family", "让家属了解每日菜单"),
            o("feedback", "收集长者对饭菜的反馈"),
            o("recommend", "根据健康情况推荐餐食"),
            o("water", "提醒用餐或饮水"),
            o("none", "不需要AI帮助"),
            o("other", "其他"),
          ],
        },
      ],
    },
    {
      id: "open",
      title: "四、开放建议（请尽量写具体）",
      questions: [
        {
          id: "m9",
          type: "longtext",
          title: "您最喜欢养老院目前哪一道菜或哪一类餐食？为什么？",
        },
        {
          id: "m10",
          type: "longtext",
          title: "在预算相近、不增加个人费用的情况下，您最希望餐食改进的一件事是什么？",
        },
        {
          id: "m11",
          type: "longtext",
          title: "您对养老院餐食、用餐服务或日常照护还有什么建议？",
        },
      ],
    },
  ],
};
