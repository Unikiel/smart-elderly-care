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
  { id: "walk", src: photos.walk, label: "A walk together" },
  { id: "meal", src: photos.meal, label: "A warm table" },
  { id: "together", src: photos.together, label: "Side by side" },
  { id: "chess", src: photos.chess, label: "Sit for a game" },
  { id: "hands", src: photos.hands, label: "Holding hands" },
  { id: "light", src: photos.light, label: "Sunlight" },
  { id: "plants", src: photos.plants, label: "Plants" },
  { id: "tea", src: photos.tea, label: "Hot tea" },
  { id: "hero", src: photos.hero, label: "The path in the garden" },
];

export function defaultStories(): StoriesContent {
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

export type StoriesPack = {
  zh: StoriesContent;
  en: StoriesContent;
};

export function defaultStoriesPack(): StoriesPack {
  const english = defaultStories();
  return { zh: english, en: english };
}

export function isStoriesPack(value: unknown): value is StoriesPack {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return Boolean(row.zh && row.en);
}

export function asStoriesPack(value: unknown): StoriesPack {
  if (isStoriesPack(value)) {
    return {
      zh: value.zh.feelings?.length ? value.zh : defaultStories(),
      en: value.en.feelings?.length ? value.en : defaultStories(),
    };
  }
  if (value && typeof value === "object" && "kicker" in value) {
    return { zh: value as StoriesContent, en: defaultStories() };
  }
  return defaultStoriesPack();
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseStoriesPack(raw: unknown): { ok: true; pack: StoriesPack } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "This content is not valid" };
  const input = raw as Record<string, unknown>;
  const zh = parseStoriesPayload(input.zh ?? input);
  if (!zh.ok) return { error: zh.error, ok: false };
  const en = parseStoriesPayload(input.en ?? defaultStories());
  return {
    ok: true,
    pack: {
      zh: zh.stories,
      en: en.ok ? en.stories : defaultStories(),
    },
  };
}

export function parseStoriesPayload(raw: unknown): { ok: true; stories: StoriesContent } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") return { ok: false, error: "This content is not valid" };
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
  if (feelings.length === 0) return { ok: false, error: "Keep at least one word and one short story" };

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
      kicker: asText(input.kicker) || "Stories from home",
      heading: asText(input.heading) || "Tap a word. Hear this page.",
      feelings,
      rail,
      grid,
    },
  };
}
