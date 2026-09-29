"use client";

import type { Album } from "@/lib/albums";
import type { Cert } from "@/lib/certs";
import type { Essay } from "@/lib/essay";
import { Albums } from "./Albums";
import { Certs } from "./Certs";
import { EssayChapter } from "./Essay";

export function Stories({
  essay,
  albums,
  certs,
}: {
  essay: Essay | null;
  albums: Album[];
  certs: Cert[];
}) {
  return (
    <>
      {essay ? <EssayChapter essay={essay} /> : null}
      <Certs certs={certs} />
      <Albums albums={albums} />
    </>
  );
}
