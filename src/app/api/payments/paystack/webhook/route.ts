import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { recordPayment } from "@/lib/bookings";

/** Configure this URL in the Paystack dashboard. Requests are authenticated with the HMAC signature. */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new Response("Not configured", { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") ?? "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return new Response("Invalid signature", { status: 401 });

  const event = JSON.parse(raw) as {
    event: string;
    data?: { status: string; amount: number; currency: string; reference: string; metadata?: { bookingReference?: string } };
  };
  if (event.event === "charge.success" && event.data?.status === "success" && event.data.currency === "NGN") {
    const [bk] = await db.select().from(bookings).where(eq(bookings.reference, event.data.metadata?.bookingReference ?? ""));
    if (bk && event.data.amount >= (bk.amountDueNgn > 0 ? bk.amountDueNgn : bk.priceNgn) * 100) {
      await recordPayment({ bookingId: bk.id, provider: "paystack", reference: event.data.reference, amountNgn: Math.round(event.data.amount / 100) });
    }
  }
  return new Response("ok");
}
