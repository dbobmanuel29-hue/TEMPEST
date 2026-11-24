import { and, eq, inArray, gte } from "drizzle-orm";
import { db } from "@/db";
import { barbers, bookings } from "@/db/schema";
import { HttpError, ok, requireAdmin, route } from "@/lib/api";
import { nowLagos } from "@/lib/time";
import { barberSchema } from "@/lib/schemas";

export const PATCH = route<{ id: string }>(async (req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const d = barberSchema.partial().parse(await req.json());
  const [row] = await db.update(barbers).set(d).where(eq(barbers.id, id)).returning();
  if (!row) throw new HttpError("Barber not found", 404);
  return ok({ barber: row });
});

export const DELETE = route<{ id: string }>(async (_req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const upcoming = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.barberId, id), gte(bookings.date, nowLagos().date), inArray(bookings.status, ["pending", "confirmed"])))
    .limit(1);
  if (upcoming.length) throw new HttpError("This barber has upcoming bookings. Reassign or cancel them first, or deactivate the barber instead.", 409);
  await db.delete(barbers).where(eq(barbers.id, id));
  return ok();
});
