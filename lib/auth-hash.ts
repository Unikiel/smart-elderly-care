import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string, salt: string) {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function makeSalt() {
  return randomBytes(8).toString("hex");
}

export function verifyPassword(password: string, salt: string, expected: string) {
  const actual = hashPassword(password, salt);
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
