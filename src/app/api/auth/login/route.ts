import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { HttpError, ok, rateLimit, route } from "@/lib/api";
import { createSession, ensureAdminUser, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

const schema = z.object({ email: z.email("Enter a valid email").transform((s) => s.toLowerCase()), password: z.string().min(1) });

export const POST = route(async (req) => {
  rateLimit(req, "login", 10, 600_000);
  const { email, password } = schema.parse(await req.json());
  await ensureSeeded();
  await ensureAdminUser();
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (!u || !verifyPassword(password, u.passwordHash)) throw new HttpError("Incorrect email or password.", 401);
  await createSession(u.id);
  return ok({ ok: true, role: u.role });
});
