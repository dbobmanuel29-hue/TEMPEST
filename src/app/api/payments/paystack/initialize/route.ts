import { z } from "zod";
import { HttpError, appUrl, ok, rateLimit, route } from "@/lib/api";
import { findAccessibleBooking } from "@/lib/bookings";
import { getPaymentSettings, paystackConfigured } from "@/lib/settings";

const schema = z.object({ reference: z.string().min(4), email: z.string().optional() });

export const POST = route(async (req) => {
  rateLimit(req, "paystack-init", 10, 600_000);
  if (!paystackConfigured()) throw new HttpError("Online card payments are not configured yet.", 503);
  const pay = await getPaymentSettings();
  if (!pay.card.enabled) throw new HttpError("Online card payments are disabled.", 400);
  const { reference, email } = schema.parse(await req.json());
  const b = await findAccessibleBooking(reference, email);
  if (b.paymentStatus === "paid") throw new HttpError("This booking is already paid.");
  const amountNgn = b.amountDueNgn > 0 ? b.amountDueNgn : b.priceNgn;
  const txRef = `${b.reference}-${Date.now().toString(36)}`;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: b.customerEmail,
      amount: amountNgn * 100, // kobo
      currency: "NGN",
      reference: txRef,
      callback_url: `${appUrl(req)}/api/payments/paystack/callback`,
      metadata: { bookingReference: b.reference },
    }),
  });
  const json = (await res.json()) as { status: boolean; message?: string; data?: { authorization_url: string } };
  if (!res.ok || !json.status || !json.data) throw new HttpError(json.message || "Could not start payment.", 502);
  return ok({ url: json.data.authorization_url });
});
