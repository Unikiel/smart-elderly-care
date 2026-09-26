import { readdirSync, statSync } from "fs";
import path from "path";

const imageFile = /\.(jpe?g|png|webp|heic|heif)$/i;

const coverFile: Record<string, string> = {
  "affluent suburb": "IMG_8449.HEIC",
  "mid-range community": "Weixin Image_20260707152815_13_333.jpg",
  "upscale urban": "IMG_8401.HEIC",
};

const hiddenFile = new Set(["upscale urban/IMG_8395.jpg"]);

export type AlbumPhoto = {
  name: string;
  src: string;
};

export type Album = {
  name: string;
  cover: string;
  photos: AlbumPhoto[];
};

function mediaUrl(album: string, file: string) {
  return `/media/albums/${encodeURIComponent(album)}/${encodeURIComponent(file)}`;
}

export function listAlbums(): Album[] {
  const docs = path.join(process.cwd(), "docs");
  let folders: string[] = [];
  try {
    folders = readdirSync(docs, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }

  return folders.flatMap((name) => {
    const files = readdirSync(path.join(docs, name))
      .filter(
        (file) =>
          imageFile.test(file) &&
          !hiddenFile.has(`${name}/${file}`) &&
          statSync(path.join(docs, name, file)).isFile(),
      )
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    if (files.length === 0) return [];
    const preferred = coverFile[name];
    const cover = preferred && files.includes(preferred) ? preferred : files[0];
    const ordered = [cover, ...files.filter((file) => file !== cover)];
    return [
      {
        name,
        cover: mediaUrl(name, cover),
        photos: ordered.map((file) => ({ name: file, src: mediaUrl(name, file) })),
      },
    ];
  });
}

export function albumFile(album: string, file: string) {
  if (!album || !file || album !== path.basename(album) || file !== path.basename(file)) return null;
  if (album.includes("..") || file.includes("..")) return null;
  const docs = path.resolve(process.cwd(), "docs");
  const full = path.resolve(docs, album, file);
  if (full !== path.join(docs, album, file)) return null;
  if (!imageFile.test(file) || hiddenFile.has(`${album}/${file}`)) return null;
  try {
    if (!statSync(full).isFile()) return null;
  } catch {
    return null;
  }
  return full;
}
