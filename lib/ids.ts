import { randomBytes } from "crypto";

export function uid(prefix = "") {
  const id = randomBytes(8).toString("hex");
  return prefix ? `${prefix}_${id}` : id;
}

export function token() {
  return randomBytes(12).toString("hex");
}
