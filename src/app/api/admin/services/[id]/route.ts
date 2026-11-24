import { eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { HttpError, ok, requireAdmin, route } from "@/lib/api";
import { serviceSchema } from "@/lib/schemas";

export const PATCH = route<{ id: string }>(async (req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const d = serviceSchema.partial().parse(await req.json());
  const [row] = await db.update(services).set(d).where(eq(services.id, id)).returning();
  if (!row) throw new HttpError("Service not found", 404);
  return ok({ service: row });
});

export const DELETE = route<{ id: string }>(async (_req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await db.delete(services).where(eq(services.id, id));
  return ok();
});
