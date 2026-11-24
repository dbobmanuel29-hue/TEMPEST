import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import type { BusinessSettings, ContactSettings, PaymentSettings, WeekHours } from "@/lib/types";

type Db = typeof db;

import { defaultWeek } from "@/lib/week";
export { defaultWeek };

export const DEFAULTS = {
  business: {
    hours: defaultWeek(),
    breaks: [{ start: "13:00", end: "14:00", label: "Lunch break" }],
    closures: [],
    slotInterval: 30,
    leadTimeMinutes: 60,
    maxAdvanceDays: 60,
    cancelHoursBefore: 24,
    autoConfirm: false,
  } satisfies BusinessSettings,
  payments: {
    payAtShop: true,
    bankTransfer: { enabled: false, details: "" },
    card: { enabled: false },
    mode: "none",
    depositPercent: 30,
  } satisfies PaymentSettings,
  contact: {
    address: "[Business address — update in Admin › Settings]",
    phone: "+234 000 000 0000",
    whatsapp: "2340000000000",
    email: "hello@tempestbarber.example",
    instagram: "",
    tiktok: "",
    mapQuery: "Lagos, Nigeria",
    adminNotifyEmail: "",
  } satisfies ContactSettings,
};

export type SettingKey = keyof typeof DEFAULTS;

export async function getSetting<K extends SettingKey>(key: K, dbx: Db = db): Promise<(typeof DEFAULTS)[K]> {
  const [row] = await dbx.select().from(settings).where(eq(settings.key, key));
  const stored = (row?.value ?? {}) as Record<string, unknown>;
  const base = DEFAULTS[key] as Record<string, unknown>;
  const merged = { ...base, ...stored } as Record<string, unknown>;
  if (key === "business") {
    merged.hours = { ...defaultWeek(), ...((stored.hours as WeekHours | undefined) ?? {}) };
  }
  return merged as (typeof DEFAULTS)[K];
}

export const getBusiness = (dbx: Db = db) => getSetting("business", dbx);
export const getPaymentSettings = () => getSetting("payments");
export const getContact = () => getSetting("contact");

export async function saveSetting(key: SettingKey, value: unknown) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

export const paystackConfigured = () => Boolean(process.env.PAYSTACK_SECRET_KEY);
export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
export const googleConfigured = () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
