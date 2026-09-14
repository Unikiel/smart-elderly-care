import { createHash } from "crypto";
import { cookies } from "next/headers";
import { verifyPassword } from "./auth-hash";
import { findUserByEmail, findUserById, type StoreUser } from "./store";

const COOKIE = "sec_session";
const SECRET = process.env.AUTH_SECRET ?? "local-dev-only-change-me";

export { hashPassword, makeSalt, verifyPassword } from "./auth-hash";

function sign(payload: string) {
  return createHash("sha256").update(`${SECRET}:${payload}`).digest("hex");
}

export async function createSession(userId: string) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `${userId}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const jar = await cookies();
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSessionUser(): Promise<StoreUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (sign(`${userId}.${exp}`) !== sig) return null;
  if (Number(exp) < Date.now()) return null;
  return findUserById(userId);
}

export function loginStaff(email: string, password: string) {
  const user = findUserByEmail(email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return null;
  }
  return user;
}
