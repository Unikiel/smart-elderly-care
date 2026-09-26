import { inflateRawSync } from "zlib";
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const essayPath = path.join(root, "docs", "Michael_Essay_Revised.docx");

function zipEntry(buf, name) {
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

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function paragraphRuns(xml) {
  return xml.split(/<w:p[ >]/).slice(1).map((chunk) => {
    const body = chunk.split("</w:p>")[0] ?? "";
    const runs = [];
    for (const match of body.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)) {
      runs.push(decodeXml(match[1] ?? ""));
    }
    return runs;
  });
}

function referenceOf(line) {
  const match = line.match(/https?:\/\/\S+/);
  if (!match) return { citation: line };
  const href = match[0].replace(/[).,]+$/, "");
  return { citation: line.replace(match[0], "").replace(/\s+$/, ""), href };
}

const xml = zipEntry(readFileSync(essayPath), "word/document.xml").toString("utf8");
const paragraphs = paragraphRuns(xml)
  .map((runs) => runs.map((run) => run.trim()).filter(Boolean))
  .filter((runs) => runs.length > 0);
const [heading, ...rest] = paragraphs;
const [titleLine, author] = heading;
const split = titleLine.split(/:\s+/);
const title = split[0] ?? titleLine;
const subtitle = split.slice(1).join(": ");
const body = [];
const references = [];
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

const essay = { title, subtitle, author: author ?? "", paragraphs: body, references };
const destDir = path.join(root, "content");
mkdirSync(destDir, { recursive: true });
writeFileSync(path.join(destDir, "essay.json"), JSON.stringify(essay, null, 2));
console.log(title, author, body.length, references.length);
