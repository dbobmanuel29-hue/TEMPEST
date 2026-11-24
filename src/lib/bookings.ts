import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { HttpError } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { nowLagos } from "@/lib/time";
import type { PaymentSettings } from "@/lib/types";

const localEpochMin = (date: string, min: number) => Date.parse(`${date}T00:00:00Z`) / 60000 + min;

export function minutesUntil(date: string, startMin: number) {
  const n = nowLagos();
  return localEpochMin(date, startMin) - localEpochMin(n.date, n.minutes);
}

export function cancelState(b: { status: string; date: string; startMin: number }, cancelHoursBefore: number) {
  const open = b.status === "pending" || b.status === "confirmed";
  const until = minutesUntil(b.date, b.startMin);
  return { open, canCancel: open && until >= cancelHoursBefore * 60, canReschedule: open && until > 0 };
}

export function depositFor(p: PaymentSettings, price: number) {
  if (p.mode === "full") return price;
  if (p.mode === "deposit") return Math.min(price, Math.ceil((price * p.depositPercent) / 100));
  return 0;
}

export async function findAccessibleBooking(reference: string, email?: string) {
  const user = await getUser();
  const [b] = await db.select().from(bookings).where(eq(bookings.reference, reference.trim().toUpperCase()));
  if (!b) throw new HttpError("Booking not found.", 404);
  const owner = user && (b.userId === user.id || b.customerEmail === user.email.toLowerCase());
  const emailOk = email && email.trim().toLowerCase() === b.customerEmail;
  if (!owner && !emailOk) throw new HttpError("Booking not found.", 404);
  return b;
}

/** Records a successful payment and recalculates the booking's payment status. Idempotent per reference. */
export async function recordPayment(opts: {
  bookingId: string;
  provider: "paystack" | "cash" | "bank_transfer" | "pos";
  reference?: string | null;
  amountNgn: number;
  note?: string;
}) {
  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(payments)
      .values({
        bookingId: opts.bookingId,
        provider: opts.provider,
        reference: opts.reference ?? null,
        amountNgn: opts.amountNgn,
        status: "success",
        note: opts.note ?? "",
      })
      .onConflictDoNothing()
      .returning({ id: payments.id });
    if (!inserted.length) return;
    const [sum] = await tx
      .select({ total: sql<number>`coalesce(sum(${payments.amountNgn}),0)::int` })
      .from(payments)
      .where(sql`${payments.bookingId} = ${opts.bookingId} and ${payments.status} = 'success'`);
    const [b] = await tx.select().from(bookings).where(eq(bookings.id, opts.bookingId));
    if (!b) return;
    const paymentStatus = sum.total >= b.priceNgn ? "paid" : sum.total > 0 ? "partial" : "unpaid";
    await tx
      .update(bookings)
      .set({
        paymentStatus,
        status: b.status === "pending" && b.amountDueNgn > 0 && sum.total >= b.amountDueNgn ? "confirmed" : b.status,
      })
      .where(eq(bookings.id, opts.bookingId));
  });
}
