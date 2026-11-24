import crypto from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const COOKIE = "tb_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  hasPassword: boolean;
};

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await db.insert(sessions).values({ tokenHash: sha256(token), userId, expiresAt });
  const h = await headers();
  const secure = h.get("x-forwarded-proto") === "https";
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
  jar.delete(COOKIE);
}

export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      role: users.role,
      passwordHash: users.passwordHash,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())));
  if (!row) return null;
  const { passwordHash, ...rest } = row;
  return { ...rest, hasPassword: Boolean(passwordHash) };
});

export async function getAdmin() {
  const u = await getUser();
  return u && u.role === "admin" ? u : null;
}

let adminEnsured = false;
/** Creates the initial administrator from ADMIN_EMAIL / ADMIN_PASSWORD env vars (never from client input). */
export async function ensureAdminUser() {
  if (adminEnsured) return;
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const [existing] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.email, email));
  if (!existing) {
    await db
      .insert(users)
      .values({ name: "Tempest Admin", email, passwordHash: hashPassword(password), role: "admin" })
      .onConflictDoNothing();
  } else if (existing.role !== "admin") {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
  }
  adminEnsured = true;
}
