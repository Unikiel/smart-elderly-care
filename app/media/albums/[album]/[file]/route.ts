import { createHash } from "crypto";
import { spawnSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { albumFile } from "@/lib/albums";

export const dynamic = "force-dynamic";

function webJpeg(source: string) {
  const stat = statSync(source);
  const key = createHash("sha1").update(`${source}\0${stat.mtimeMs}\0${stat.size}`).digest("hex");
  const dest = path.join(process.cwd(), ".tmp", "album-cache", `${key}.jpg`);
  if (!existsSync(dest)) {
    mkdirSync(path.dirname(dest), { recursive: true });
    const script = path.join(process.cwd(), "scripts", "album-jpeg.py");
    const result = spawnSync("python", [script, source, dest], { encoding: "utf8" });
    if (result.status !== 0 || !existsSync(dest)) return null;
  }
  return readFileSync(dest);
}

export async function GET(_request: Request, { params }: { params: Promise<{ album: string; file: string }> }) {
  const { album, file } = await params;
  const source = albumFile(decodeURIComponent(album), decodeURIComponent(file));
  if (!source) return new NextResponse("not found", { status: 404 });
  const jpeg = webJpeg(source);
  if (!jpeg) return new NextResponse("not found", { status: 404 });
  return new NextResponse(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
