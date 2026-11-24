import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { HttpError, ok, rateLimit, route } from "@/lib/api";
import { cancelState, findAccessibleBooking } from "@/lib/bookings";
import { notifyRescheduleRequested } from "@/lib/notify";
import { getBusiness } from "@/lib/settings";
import { isDateString, nowLagos } from "@/lib/time";

const schema = z.object({
  email: z.string().optional(),
  date: z.string().refine(isDateString, "Choose a valid date"),
  startMin: z.number().int().min(0).max(1439).nullable().default(null),
  note: z.string().trim().max(500).default(""),
});

export const POST = route<{ reference: string }>(async (req, ctx) => {
  rateLimit(req, "reschedule", 10, 600_000);
  const { reference } = await ctx.params;
  const d = schema.parse(await req.json());
  const b = await findAccessibleBooking(reference, d.email);
  const business = await getBusiness();
  if (!cancelState(b, business.cancelHoursBefore).canReschedule) throw new HttpError("This booking can't be rescheduled online.");
  if (d.date < nowLagos().date) throw new HttpError("Choose a future date.");
  const [updated] = await db
    .update(bookings)
    .set({ rescheduleRequest: { date: d.date, startMin: d.startMin, note: d.note, requestedAt: new Date().toISOString(), status: "open" } })
    .where(eq(bookings.id, b.id))
    .returning();
  await notifyRescheduleRequested(updated).catch((e) => console.error(e));
  return ok({ booking: updated });
});
