import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { HttpError, ok, rateLimit, route } from "@/lib/api";
import { cancelState, findAccessibleBooking } from "@/lib/bookings";
import { notifyStatusChange } from "@/lib/notify";
import { getBusiness } from "@/lib/settings";

const schema = z.object({ email: z.string().optional() });

export const POST = route<{ reference: string }>(async (req, ctx) => {
  rateLimit(req, "cancel", 15, 600_000);
  const { reference } = await ctx.params;
  const { email } = schema.parse(await req.json().catch(() => ({})));
  const b = await findAccessibleBooking(reference, email);
  const business = await getBusiness();
  const st = cancelState(b, business.cancelHoursBefore);
  if (!st.open) throw new HttpError("This booking can no longer be cancelled.");
  if (!st.canCancel) {
    throw new HttpError(
      `Bookings can be cancelled online up to ${business.cancelHoursBefore} hours before the appointment. Please contact the shop directly.`,
      403,
    );
  }
  const [updated] = await db
    .update(bookings)
    .set({ status: "cancelled", cancelledAt: new Date(), cancelledBy: "customer" })
    .where(eq(bookings.id, b.id))
    .returning();
  await notifyStatusChange(updated, "customer").catch((e) => console.error(e));
  return ok({ booking: updated });
});
