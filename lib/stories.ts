import { photos } from "./photos";

export type StoryFeeling = {
  id: string;
  key: string;
  story: string;
};

export type StoryRailItem = {
  id: string;
  src: string;
  title: string;
  line: string;
};

export type StoryGridItem = {
  id: string;
  src: string;
  title: string;
};

export type StoryPhoto = {
  id: string;
  src: string;
  label: string;
};

export type StoriesContent = {
  kicker: string;
  heading: string;
  feelings: StoryFeeling[];
  rail: StoryRailItem[];
  grid: StoryGridItem[];
};

export const builtInPhotos: StoryPhoto[] = [
  { id: "walk", src: photos.walk, label: "一起走走" },
  { id: "meal", src: photos.meal, label: "一桌热饭" },
  { id: "together", src: photos.together, label: "并肩走走" },
  { id: "chess", src: photos.chess, label: "坐下来下一盘" },
  { id: "hands", src: photos.hands, label: "牵着手" },
  { id: "light", src: photos.light, label: "阳光" },
  { id: "plants", src: photos.plants, label: "花草" },
  { id: "tea", src: photos.tea, label: "热茶" },
  { id: "hero", src: photos.hero, label: "院子里的路" },
];

export function defaultStories(locale: "zh" | "en" = "zh"): StoriesContent {
  if (locale === "en") {
    return {
      kicker: "Stories from home",
      heading: "Tap a word. Hear this page.",
      feelings: [
        { id: "warm", key: "Warmth", story: "A hot cup of tea, and a slow kind word. A day feels warm when you are remembered." },
        { id: "care", key: "Care", story: "Care is not the machine. It is someone who knows when you sleep, and what you like to eat." },
        { id: "hope", key: "Hope", story: "Tomorrow can be kinder. First, say how today felt." },
        { id: "wise", key: "Wisdom", story: "Good wisdom stays quiet. It saves effort, and leaves you more at ease." },
      ],
      rail: [
        { id: "rail-chess", src: photos.chess, title: "Sit for a game", line: "When someone stays with you, time is in no hurry." },
        { id: "rail-meal", src: photos.meal, title: "A warm table", line: "Only you know if the food tastes right." },
        { id: "rail-walk", src: photos.walk, title: "A walk together", line: "The light in the garden is just enough." },
        { id: "rail-together", src: photos.together, title: "Side by side", line: "A companion on the path warms the heart." },
      ],
      grid: [
        { id: "grid-hands", src: photos.hands, title: "Dignity" },
        { id: "grid-together", src: photos.together, title: "Company" },
        { id: "grid-light", src: photos.light, title: "Ease" },
        { id: "grid-meal", src: photos.meal, title: "Meals" },
        { id: "grid-walk", src: photos.walk, title: "Family" },
        { id: "grid-chess", src: photos.chess, title: "Home" },
      ],
    };
  }
  return {
    kicker: "院里的故事",
    heading: "点一个词，听听这一页",
    feelings: [
      { id: "warm", key: "温暖", story: "一杯热茶，一句慢话。日子是被记得，才暖和的。" },
      { id: "care", key: "照护", story: "照护不是机器本身，是有人记得您几点睡、爱吃什么。" },
      { id: "hope", key: "希望", story: "明天可以更好。先把今天的感受，轻轻说出来。" },
      { id: "wise", key: "智慧", story: "好的智慧不添乱。它省力，让人更自在。" },
    ],
    rail: [
      { id: "rail-chess", src: photos.chess, title: "坐下来下一盘", line: "有人陪着，时间就不急。" },
      { id: "rail-meal", src: photos.meal, title: "一桌热饭", line: "合不合口，只有您知道。" },
      { id: "rail-walk", src: photos.walk, title: "一起走走", line: "院子里的阳光，刚刚好。" },
      { id: "rail-together", src: photos.together, title: "并肩走走", line: "路上有伴，心里就暖。" },
    ],
    grid: [
      { id: "grid-hands", src: photos.hands, title: "尊严" },
      { id: "grid-together", src: photos.together, title: "陪伴" },
      { id: "grid-light", src: photos.light, title: "安心" },
      { id: "grid-meal", src: photos.meal, title: "餐食" },
      { id: "grid-walk", src: photos.walk, title: "家属" },
      { id: "grid-chess", src: photos.chess, title: "院里" },
    ],
  };
}

export type StoriesPack = {
  zh: StoriesContent;
  en: StoriesContent;
};

export function defaultStoriesPack(): StoriesPack {
  return { zh: defaultStories("zh"), en: defaultStories("en") };
}

export function isStoriesPack(value: unknown): value is StoriesPack {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return Boolean(row.zh && row.en);
}

export function asStoriesPack(value: unknown): StoriesPack {
  if (isStoriesPack(value)) {
    return {
      zh: value.zh.feelings?.length ? value.zh : defaultStories("zh"),
      en: value.en.feelings?.length ? value.en : defaultStories("en"),
    };
  }
  if (value && typeof value === "object" && "kicker" in value) {
    return { zh: value as StoriesContent, en: defaultStories("en") };
  }
  return defaultStoriesPack();
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseStoriesPack(raw: unknown): { ok: true; pack: StoriesPack } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "内容无效" };
  const input = raw as Record<string, unknown>;
  const zh = parseStoriesPayload(input.zh ?? input);
  if (!zh.ok) return { error: zh.error, ok: false };
  const en = parseStoriesPayload(input.en ?? defaultStories("en"));
  return {
    ok: true,
    pack: {
      zh: zh.stories,
      en: en.ok ? en.stories : defaultStories("en"),
    },
  };
}

export function parseStoriesPayload(raw: unknown): { ok: true; stories: StoriesContent } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "内容无效" };
  const input = raw as Record<string, unknown>;
  const feelings = Array.isArray(input.feelings)
    ? input.feelings
        .map((item, index) => {
          const row = item as Record<string, unknown>;
          return {
            id: asText(row.id) || `feeling-${index + 1}`,
            key: asText(row.key),
            story: asText(row.story),
          };
        })
        .filter((item) => item.key && item.story)
    : [];
  if (feelings.length === 0) return { ok: false, error: "至少留下一个词和一段话" };

  const rail = Array.isArray(input.rail)
    ? input.rail
        .map((item, index) => {
          const row = item as Record<string, unknown>;
          return {
            id: asText(row.id) || `rail-${index + 1}`,
            src: asText(row.src),
            title: asText(row.title),
            line: asText(row.line),
          };
        })
        .filter((item) => item.src && item.title)
    : [];

  const grid = Array.isArray(input.grid)
    ? input.grid
        .map((item, index) => {
          const row = item as Record<string, unknown>;
          return {
            id: asText(row.id) || `grid-${index + 1}`,
            src: asText(row.src),
            title: asText(row.title),
          };
        })
        .filter((item) => item.src && item.title)
    : [];

  return {
    ok: true,
    stories: {
      kicker: asText(input.kicker) || "院里的故事",
      heading: asText(input.heading) || "点一个词，听听这一页",
      feelings,
      rail,
      grid,
    },
  };
}
