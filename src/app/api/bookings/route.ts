import { z } from "zod";
import { HttpError, ok, rateLimit, route } from "@/lib/api";
import { createBooking } from "@/lib/availability";
import { getUser } from "@/lib/auth";
import { depositFor } from "@/lib/bookings";
import { notifyBookingCreated } from "@/lib/notify";
import { getBusiness, getPaymentSettings, paystackConfigured } from "@/lib/settings";
import { isDateString } from "@/lib/time";

const schema = z.object({
  serviceId: z.uuid(),
  barberId: z.uuid().nullable(),
  date: z.string().refine(isDateString, "Invalid date"),
  startMin: z.number().int().min(0).max(1439),
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z.string().trim().regex(/^[+()\d\s-]{7,20}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email"),
  notes: z.string().trim().max(500).default(""),
  paymentMethod: z.enum(["pay_at_shop", "bank_transfer", "card"]).default("pay_at_shop"),
});

export const POST = route(async (req) => {
  rateLimit(req, "booking", 12, 600_000);
  const d = schema.parse(await req.json());
  const [pay, business, user] = await Promise.all([getPaymentSettings(), getBusiness(), getUser()]);

  const allowed =
    (d.paymentMethod === "pay_at_shop" && pay.payAtShop && pay.mode === "none") ||
    (d.paymentMethod === "bank_transfer" && pay.bankTransfer.enabled) ||
    (d.paymentMethod === "card" && pay.card.enabled && paystackConfigured());
  if (!allowed) throw new HttpError("That payment option isn't available. Please choose another.");

  const booking = await createBooking(
    { ...d, userId: user?.id ?? null },
    { depositFor: (price) => depositFor(pay, price), autoConfirm: business.autoConfirm },
  );
  await notifyBookingCreated(booking).catch((e) => console.error("notify", e));
  return ok({ booking }, 201);
});
