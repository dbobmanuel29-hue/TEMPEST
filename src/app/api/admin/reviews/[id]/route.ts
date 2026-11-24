import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { ok, requireAdmin, route } from "@/lib/api";

export const PATCH = route<{ id: string }>(async (req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const { status } = z.object({ status: z.enum(["pending", "approved", "rejected"]) }).parse(await req.json());
  await db.update(reviews).set({ status }).where(eq(reviews.id, id));
  return ok();
});

export const DELETE = route<{ id: string }>(async (_req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await db.delete(reviews).where(eq(reviews.id, id));
  return ok();
});
