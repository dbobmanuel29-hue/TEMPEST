import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";
import { HttpError, ok, rateLimit, route } from "@/lib/api";
import { hashPassword, sha256 } from "@/lib/auth";

const schema = z.object({ token: z.string().min(10), password: z.string().min(8, "Password must be at least 8 characters").max(100) });

export const POST = route(async (req) => {
  rateLimit(req, "reset", 10, 600_000);
  const { token, password } = schema.parse(await req.json());
  const th = sha256(token);
  const [r] = await db
    .select()
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, th), isNull(passwordResets.usedAt), gt(passwordResets.expiresAt, new Date())));
  if (!r) throw new HttpError("This reset link is invalid or has expired.", 400);
  await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, r.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.tokenHash, th));
  await db.delete(sessions).where(eq(sessions.userId, r.userId));
  return ok();
});
