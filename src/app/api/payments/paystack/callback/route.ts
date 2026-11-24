import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { appUrl } from "@/lib/api";
import { recordPayment } from "@/lib/bookings";

/** Paystack redirects the customer here. Nothing is marked paid until Paystack's verify API confirms it. */
export async function GET(req: Request) {
  const base = appUrl(req);
  const txRef = new URL(req.url).searchParams.get("reference") ?? new URL(req.url).searchParams.get("trxref");
  const bookingRef = txRef?.split("-").slice(0, 2).join("-") ?? "";
  const back = (state: string) => NextResponse.redirect(new URL(`/booking/manage?ref=${encodeURIComponent(bookingRef)}&payment=${state}`, base));
  if (!txRef || !process.env.PAYSTACK_SECRET_KEY) return back("failed");
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(txRef)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    const json = (await res.json()) as {
      status: boolean;
      data?: { status: string; amount: number; currency: string; reference: string; metadata?: { bookingReference?: string } };
    };
    const d = json.data;
    if (!res.ok || !json.status || !d || d.status !== "success" || d.currency !== "NGN") return back("failed");
    const [b] = await db.select().from(bookings).where(eq(bookings.reference, d.metadata?.bookingReference ?? ""));
    if (!b) return back("failed");
    const expected = (b.amountDueNgn > 0 ? b.amountDueNgn : b.priceNgn) * 100;
    if (d.amount < expected) return back("failed");
    await recordPayment({ bookingId: b.id, provider: "paystack", reference: d.reference, amountNgn: Math.round(d.amount / 100) });
    return back("success");
  } catch (e) {
    console.error("paystack verify", e);
    return back("failed");
  }
}
