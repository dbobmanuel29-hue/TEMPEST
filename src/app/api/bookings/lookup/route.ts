import { z } from "zod";
import { ok, rateLimit, route } from "@/lib/api";
import { cancelState, findAccessibleBooking } from "@/lib/bookings";
import { getBusiness } from "@/lib/settings";

const schema = z.object({ reference: z.string().min(4).max(20), email: z.string().optional() });

export const POST = route(async (req) => {
  rateLimit(req, "lookup", 20, 600_000);
  const { reference, email } = schema.parse(await req.json());
  const b = await findAccessibleBooking(reference, email);
  const business = await getBusiness();
  return ok({ booking: b, policy: cancelState(b, business.cancelHoursBefore), cancelHoursBefore: business.cancelHoursBefore });
});
