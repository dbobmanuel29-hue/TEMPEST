import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { HttpError, ok, requireAdmin, route } from "@/lib/api";
import { updateBookingDetails } from "@/lib/availability";
import { notifyStatusChange } from "@/lib/notify";

const schema = z.object({
  action: z.enum(["confirm", "cancel", "complete", "no_show", "edit", "dismiss_reschedule"]),
  patch: z
    .object({
      serviceId: z.uuid().optional(),
      barberId: z.uuid().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      startMin: z.number().int().min(0).max(1439).optional(),
      customerName: z.string().trim().min(2).max(80).optional(),
      customerPhone: z.string().trim().max(30).optional(),
      customerEmail: z.email().optional(),
      notes: z.string().max(500).optional(),
    })
    .optional(),
});

const STATUS = { confirm: "confirmed", cancel: "cancelled", complete: "completed", no_show: "no_show" } as const;

export const PATCH = route<{ id: string }>(async (req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const { action, patch } = schema.parse(await req.json());

  if (action === "edit") {
    const row = await updateBookingDetails(id, patch ?? {});
    return ok({ booking: row });
  }
  if (action === "dismiss_reschedule") {
    const [cur] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!cur) throw new HttpError("Not found", 404);
    const [row] = await db
      .update(bookings)
      .set({ rescheduleRequest: cur.rescheduleRequest ? { ...cur.rescheduleRequest, status: "resolved" } : null })
      .where(eq(bookings.id, id))
      .returning();
    return ok({ booking: row });
  }
  const status = STATUS[action];
  const [row] = await db
    .update(bookings)
    .set({ status, ...(status === "cancelled" ? { cancelledAt: new Date(), cancelledBy: "admin" } : {}) })
    .where(eq(bookings.id, id))
    .returning();
  if (!row) throw new HttpError("Booking not found", 404);
  if (status === "confirmed" || status === "cancelled") await notifyStatusChange(row, "admin").catch((e) => console.error(e));
  return ok({ booking: row });
});
