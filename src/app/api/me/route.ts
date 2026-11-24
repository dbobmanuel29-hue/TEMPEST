import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { HttpError, ok, requireUser, route } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  avatarUrl: z.string().max(300).nullable().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100).optional(),
});

export const PATCH = route(async (req) => {
  const me = await requireUser();
  const d = schema.parse(await req.json());
  const set: Partial<typeof users.$inferInsert> = {};
  if (d.name !== undefined) set.name = d.name;
  if (d.phone !== undefined) set.phone = d.phone || null;
  if (d.avatarUrl !== undefined) set.avatarUrl = d.avatarUrl;
  if (d.newPassword) {
    const [u] = await db.select().from(users).where(eq(users.id, me.id));
    if (u.passwordHash && !verifyPassword(d.currentPassword ?? "", u.passwordHash)) {
      throw new HttpError("Current password is incorrect.", 400);
    }
    set.passwordHash = hashPassword(d.newPassword);
  }
  if (Object.keys(set).length) await db.update(users).set(set).where(eq(users.id, me.id));
  return ok();
});
