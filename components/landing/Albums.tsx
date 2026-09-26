"use client";

import { useEffect, useState } from "react";
import { FullPhoto } from "@/components/media/FullPhoto";
import type { Album } from "@/lib/albums";
import { FlyPhoto } from "./FlyPhoto";

const flyFrom = ["left", "up", "right"] as const;

export function Albums({ albums }: { albums: Album[] }) {
  const [openName, setOpenName] = useState<string | null>(null);
  const open = albums.find((album) => album.name === openName) ?? null;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenName(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (albums.length === 0) return null;

  if (open) {
    return (
      <section id="albums" className="mx-auto max-w-[1280px] scroll-mt-16 px-5 py-16 md:px-12 md:py-24">
        <button
          type="button"
          onClick={() => setOpenName(null)}
          className="min-h-10 text-[16px] font-medium text-[#8b5a32] hover:text-[#3a2718]"
        >
          ← All albums
        </button>
        <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">{open.name}</h2>
        <p className="mt-2 text-[16px] text-[#8b5a32]">
          {open.photos.length} {open.photos.length === 1 ? "photo" : "photos"}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {open.photos.map((photo) => (
            <figure key={photo.src} className="relative aspect-[4/3] overflow-hidden bg-[#ffe0b0]">
              <FullPhoto src={photo.src} />
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="albums" className="mx-auto grid max-w-[1280px] scroll-mt-16 gap-4 px-5 py-16 sm:grid-cols-2 md:grid-cols-3 md:px-12 md:py-24">
      {albums.map((album, index) => (
        <button
          key={album.name}
          type="button"
          onClick={() => setOpenName(album.name)}
          className="relative aspect-[4/3] overflow-hidden text-left"
        >
          <FlyPhoto
            src={album.cover}
            from={flyFrom[index % 3]}
            delay={(index % 3) * 90}
            className="absolute inset-0 h-full w-full"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3a2718]/70 to-transparent p-5 text-[18px] text-[#fff3d6]">
            {album.name}
          </span>
        </button>
      ))}
    </section>
  );
}
