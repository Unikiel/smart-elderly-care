"use client";

import type { Album } from "@/lib/albums";
import type { Essay } from "@/lib/essay";
import { Albums } from "./Albums";
import { EssayChapter } from "./Essay";

export function Stories({ essay, albums }: { essay: Essay | null; albums: Album[] }) {
  return (
    <>
      {essay ? <EssayChapter essay={essay} /> : null}
      <Albums albums={albums} />
    </>
  );
}
