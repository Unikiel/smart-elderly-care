import { inflateRawSync } from "zlib";
import { existsSync, readFileSync } from "fs";
import path from "path";
import publishedEssay from "@/content/essay.json";

export type EssayReference = {
  citation: string;
  href?: string;
};

export type Essay = {
  title: string;
  subtitle: string;
  author: string;
  paragraphs: string[];
  references: EssayReference[];
};

const essayPath = path.join(process.cwd(), "docs", "Michael_Essay_Revised.docx");

function zipEntry(buf: Buffer, name: string) {
  let offset = 0;
  while (offset + 30 < buf.length) {
    if (buf.readUInt32LE(offset) !== 0x04034b50) break;
    const method = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const entryName = buf.toString("utf8", offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const data = buf.subarray(dataStart, dataStart + compSize);
    if (entryName === name) {
      if (method === 0) return Buffer.from(data);
      if (method === 8) return inflateRawSync(data);
      return null;
    }
    offset = dataStart + compSize;
  }
  return null;
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function paragraphRuns(xml: string) {
  return xml.split(/<w:p[ >]/).slice(1).map((chunk) => {
    const body = chunk.split("</w:p>")[0] ?? "";
    const runs: string[] = [];
    for (const match of body.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)) {
      runs.push(decodeXml(match[1] ?? ""));
    }
    return runs;
  });
}

function referenceOf(line: string): EssayReference {
  const match = line.match(/https?:\/\/\S+/);
  if (!match) return { citation: line };
  const href = match[0].replace(/[).,]+$/, "");
  return { citation: line.replace(match[0], "").replace(/\s+$/, ""), href };
}

function essayFromBuffer(buf: Buffer): Essay | null {
  const xml = zipEntry(buf, "word/document.xml")?.toString("utf8");
  if (!xml) return null;
  const paragraphs = paragraphRuns(xml)
    .map((runs) => runs.map((run) => run.trim()).filter(Boolean))
    .filter((runs) => runs.length > 0);
  const [heading, ...rest] = paragraphs;
  if (!heading) return null;
  const [titleLine, author] = heading;
  const split = titleLine.split(/:\s+/);
  const title = split[0] ?? titleLine;
  const subtitle = split.slice(1).join(": ");
  const body: string[] = [];
  const references: EssayReference[] = [];
  let inReferences = false;
  for (const runs of rest) {
    const line = runs.join(" ").replace(/\s+/g, " ").trim();
    if (!line) continue;
    if (line === "References") {
      inReferences = true;
      continue;
    }
    if (inReferences) references.push(referenceOf(line));
    else body.push(line);
  }
  return { title, subtitle, author: author ?? "", paragraphs: body, references };
}

export function readEssay(): Essay | null {
  try {
    if (existsSync(essayPath)) {
      const essay = essayFromBuffer(readFileSync(essayPath));
      if (essay) return essay;
    }
  } catch {
    // The published copy is used when the local document is absent.
  }
  return publishedEssay;
}
