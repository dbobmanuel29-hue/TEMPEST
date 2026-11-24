import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { notifyReminder } from "@/lib/notify";
import { emailConfigured } from "@/lib/settings";
import { addDays, nowLagos } from "@/lib/time";

export const dynamic = "force-dynamic";

/**
 * Sends next-day reminders. Call daily (see vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 * Vercel Cron sends that header automatically when CRON_SECRET is set.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  if (!emailConfigured()) return Response.json({ sent: 0, skipped: "email not configured" });
  const tomorrow = addDays(nowLagos().date, 1);
  const rows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.date, tomorrow), inArray(bookings.status, ["pending", "confirmed"]), isNull(bookings.reminderSentAt)));
  for (const b of rows) {
    await notifyReminder(b);
    await db.update(bookings).set({ reminderSentAt: new Date() }).where(eq(bookings.id, b.id));
  }
  return Response.json({ sent: rows.length });
}
