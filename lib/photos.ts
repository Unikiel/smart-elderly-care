const sharp = (id: string, width = 4000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=90`;

export const photos = {
  hero: "/photos/cover.jpg",
  together: sharp("photo-1758686253861-bbfd56e5ba7a", 3200),
  hands: sharp("photo-1454875392665-2ac2c85e8d3e", 3200),
  meal: "/photos/meal.jpg",
  walk: sharp("photo-1559234938-b60fff04894d", 3200),
  tea: sharp("photo-1478144592103-25e21830c4f5", 3200),
  light: sharp("photo-1470252649378-9c29740c9fa8", 3200),
  plants: sharp("photo-1416879595882-3373a0480b5b", 3200),
  chess: sharp("photo-1513159446162-54eb8bdaa79b", 3200),
};

const covers = [photos.walk, photos.meal, photos.together, photos.plants, photos.hands, photos.light, photos.chess];

export function coverForSurvey(title: string, index: number) {
  if (title.includes("餐食") || title.includes("伙食") || /meal|dining/i.test(title)) return photos.meal;
  if (title.includes("AI") || title.includes("智慧") || /care|ai/i.test(title)) return photos.walk;
  return covers[index % covers.length];
}

export function invitationForSurvey(title: string) {
  if (/meal|dining|餐食|伙食/i.test(title)) return "Does the food taste right? We would like to improve it slowly.";
  if (/AI|智慧|elderly care/i.test(title)) return "Is intelligent care easy to live with? We would like to hear about your days.";
  return "We would like to hear how this feels for you.";
}
