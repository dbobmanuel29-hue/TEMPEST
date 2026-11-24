import { z } from "zod";
import { HttpError, ok, requireAdmin, route } from "@/lib/api";
import { saveSetting } from "@/lib/settings";

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const business = z.object({
  hours: z.record(z.string(), z.object({ open: z.boolean(), start: hhmm, end: hhmm })),
  breaks: z.array(z.object({ start: hhmm, end: hhmm, label: z.string().max(60) })).max(10),
  closures: z
    .array(z.object({ id: z.string(), start: date, end: date, label: z.string().max(80), type: z.enum(["holiday", "special"]) }))
    .max(200),
  slotInterval: z.number().int().min(5).max(120),
  leadTimeMinutes: z.number().int().min(0).max(2880),
  maxAdvanceDays: z.number().int().min(1).max(365),
  cancelHoursBefore: z.number().int().min(0).max(240),
  autoConfirm: z.boolean(),
});

const payments = z.object({
  payAtShop: z.boolean(),
  bankTransfer: z.object({ enabled: z.boolean(), details: z.string().max(500) }),
  card: z.object({ enabled: z.boolean() }),
  mode: z.enum(["none", "deposit", "full"]),
  depositPercent: z.number().int().min(1).max(100),
});

const contact = z.object({
  address: z.string().max(200),
  phone: z.string().max(40),
  whatsapp: z.string().max(20),
  email: z.string().max(120),
  instagram: z.string().max(200),
  tiktok: z.string().max(200),
  mapQuery: z.string().max(200),
  adminNotifyEmail: z.string().max(120),
});

const schemas = { business, payments, contact } as const;

export const PUT = route(async (req) => {
  await requireAdmin();
  const body = (await req.json()) as { key: keyof typeof schemas; value: unknown };
  const schema = schemas[body.key];
  if (!schema) throw new HttpError("Unknown setting");
  const value = schema.parse(body.value);
  await saveSetting(body.key, value);
  return ok();
});
