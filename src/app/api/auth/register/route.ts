import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { ok, rateLimit, route, HttpError } from "@/lib/api";
import { createSession, ensureAdminUser, hashPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.email("Enter a valid email").transform((s) => s.toLowerCase()),
  phone: z.string().trim().max(30).optional().default(""),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const POST = route(async (req) => {
  rateLimit(req, "register", 8, 600_000);
  const data = schema.parse(await req.json());
  await ensureSeeded();
  await ensureAdminUser();
  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email));
  if (exists) throw new HttpError("An account with this email already exists. Try signing in.", 409);
  const [u] = await db
    .insert(users)
    .values({ name: data.name, email: data.email, phone: data.phone || null, passwordHash: hashPassword(data.password) })
    .returning({ id: users.id });
  // Attach earlier guest bookings made with the same email.
  await db.update(bookings).set({ userId: u.id }).where(and(eq(bookings.customerEmail, data.email), isNull(bookings.userId)));
  await createSession(u.id);
  return ok({ ok: true });
});
