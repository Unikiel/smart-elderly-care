import { readdirSync, statSync } from "fs";
import path from "path";

export type Cert = {
  name: string;
  src: string;
};

export function listCerts(): Cert[] {
  const dir = path.join(process.cwd(), "public", "certs");
  try {
    return readdirSync(dir)
      .filter((file) => /\.pdf$/i.test(file) && statSync(path.join(dir, file)).isFile())
      .sort((a, b) => a.localeCompare(b))
      .map((file) => ({
        name: file.replace(/\.pdf$/i, ""),
        src: `/certs/${encodeURIComponent(file)}`,
      }));
  } catch {
    return [];
  }
}
