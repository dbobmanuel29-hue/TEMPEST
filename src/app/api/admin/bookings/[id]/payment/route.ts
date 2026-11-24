import { z } from "zod";
import { ok, requireAdmin, route } from "@/lib/api";
import { recordPayment } from "@/lib/bookings";

const schema = z.object({
  amountNgn: z.number().int().min(1).max(10_000_000),
  provider: z.enum(["cash", "bank_transfer", "pos"]),
  note: z.string().max(200).default(""),
});

/** Manual payment record (cash, confirmed bank transfer, POS). Card payments are only recorded via Paystack verification. */
export const POST = route<{ id: string }>(async (req, ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const d = schema.parse(await req.json());
  await recordPayment({ bookingId: id, ...d });
  return ok();
});
