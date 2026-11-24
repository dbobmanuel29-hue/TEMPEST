import { and, eq, gte, lte, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { barbers, bookings, services } from "@/db/schema";
import { getBusiness } from "@/lib/settings";
import { addDays, nowLagos, toMin, weekday } from "@/lib/time";
import { FREE_STATUSES, type BusinessSettings } from "@/lib/types";

type Db = typeof db;
type Barber = typeof barbers.$inferSelect;

export class BookingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type Ctx = {
  business: BusinessSettings;
  barbers: Barber[];
  bookings: { id: string; barberId: string | null; date: string; startMin: number; endMin: number }[];
};

export async function loadContext(from: string, to: string, dbx: Db = db): Promise<Ctx> {
  const business = await getBusiness(dbx);
  const bs = await dbx.select().from(barbers).where(eq(barbers.active, true)).orderBy(barbers.sortOrder);
  const bk = await dbx
    .select({
      id: bookings.id,
      barberId: bookings.barberId,
      date: bookings.date,
      startMin: bookings.startMin,
      endMin: bookings.endMin,
    })
    .from(bookings)
    .where(and(gte(bookings.date, from), lte(bookings.date, to), notInArray(bookings.status, FREE_STATUSES)));
  return { business, barbers: bs, bookings: bk };
}

export function closedReason(business: BusinessSettings, date: string): string | null {
  const day = business.hours[String(weekday(date))];
  if (!day?.open) return "Closed";
  const closure = business.closures.find((c) => c.start <= date && date <= c.end);
  if (closure) return closure.label || "Closed";
  return null;
}

function barberWindow(ctx: Ctx, barber: Barber, date: string): [number, number] | null {
  const wd = String(weekday(date));
  const bh = ctx.business.hours[wd];
  if (!bh?.open) return null;
  if (barber.unavailableDates.includes(date)) return null;
  const bw = barber.workingHours?.[wd];
  if (!bw?.open) return null;
  const s = Math.max(toMin(bh.start), toMin(bw.start));
  const e = Math.min(toMin(bh.end), toMin(bw.end));
  return s < e ? [s, e] : null;
}

export type Slot = { start: number; barberIds: string[] };

export function computeSlots(
  ctx: Ctx,
  date: string,
  duration: number,
  barberId: string | null,
  excludeBookingId?: string,
): Slot[] {
  const { business } = ctx;
  if (closedReason(business, date)) return [];
  const now = nowLagos();
  if (date < now.date || date > addDays(now.date, business.maxAdvanceDays)) return [];

  const map = new Map<number, string[]>();
  const candidates = ctx.barbers.filter((b) => !barberId || b.id === barberId);
  const breaks = business.breaks.map((b) => [toMin(b.start), toMin(b.end)] as const);

  for (const b of candidates) {
    const win = barberWindow(ctx, b, date);
    if (!win) continue;
    const busy = ctx.bookings.filter((x) => x.barberId === b.id && x.date === date && x.id !== excludeBookingId);
    for (let s = win[0]; s + duration <= win[1]; s += business.slotInterval) {
      const e = s + duration;
      if (date === now.date && s < now.minutes + business.leadTimeMinutes) continue;
      if (breaks.some(([bs, be]) => s < be && e > bs)) continue;
      if (busy.some((x) => s < x.endMin && e > x.startMin)) continue;
      map.set(s, [...(map.get(s) ?? []), b.id]);
    }
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([start, barberIds]) => ({ start, barberIds }));
}

/** Returns { "YYYY-MM-DD": hasSlots } for a month range. */
export async function monthAvailability(from: string, to: string, duration: number, barberId: string | null) {
  const ctx = await loadContext(from, to);
  const out: Record<string, boolean> = {};
  for (let d = from; d <= to; d = addDays(d, 1)) {
    out[d] = computeSlots(ctx, d, duration, barberId).length > 0;
  }
  return out;
}

export function makeReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `TMP-${s}`;
}

export type NewBooking = {
  serviceId: string;
  barberId: string | null;
  date: string;
  startMin: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  userId: string | null;
  paymentMethod: string;
};

export async function createBooking(input: NewBooking, opts: { depositFor: (price: number) => number; autoConfirm: boolean }) {
  return db.transaction(async (tx) => {
    // Serialise all booking attempts for the same date: prevents simultaneous double-booking.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"tempest-booking:" + input.date}))`);
    const [svc] = await tx.select().from(services).where(eq(services.id, input.serviceId));
    if (!svc || !svc.active) throw new BookingError("This service is no longer available.", 404);

    const ctx = await loadContext(input.date, input.date, tx as unknown as Db);
    const slots = computeSlots(ctx, input.date, svc.durationMin, input.barberId);
    const slot = slots.find((s) => s.start === input.startMin);
    if (!slot) throw new BookingError("Sorry, that time was just taken. Please choose another slot.", 409);

    let barberId = input.barberId;
    if (!barberId) {
      const load = (id: string) => ctx.bookings.filter((b) => b.barberId === id && b.date === input.date).length;
      barberId = [...slot.barberIds].sort((a, b) => load(a) - load(b))[0];
    }
    const barber = ctx.barbers.find((b) => b.id === barberId);
    if (!barber) throw new BookingError("Barber unavailable.", 409);

    const [row] = await tx
      .insert(bookings)
      .values({
        reference: makeReference(),
        serviceId: svc.id,
        serviceName: svc.name,
        durationMin: svc.durationMin,
        priceNgn: svc.priceNgn,
        barberId: barber.id,
        barberName: barber.name,
        userId: input.userId,
        customerName: input.name,
        customerPhone: input.phone,
        customerEmail: input.email.toLowerCase(),
        notes: input.notes,
        date: input.date,
        startMin: input.startMin,
        endMin: input.startMin + svc.durationMin,
        status: opts.autoConfirm ? "confirmed" : "pending",
        paymentMethod: input.paymentMethod,
        amountDueNgn: opts.depositFor(svc.priceNgn),
      })
      .returning();
    return row;
  });
}

export type BookingPatch = {
  serviceId?: string;
  barberId?: string;
  date?: string;
  startMin?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
};

/** Admin edit / reschedule. Re-validates the slot under the same lock as new bookings. */
export async function updateBookingDetails(id: string, patch: BookingPatch) {
  return db.transaction(async (tx) => {
    const [cur] = await tx.select().from(bookings).where(eq(bookings.id, id));
    if (!cur) throw new BookingError("Booking not found", 404);
    const date = patch.date ?? cur.date;
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${"tempest-booking:" + date}))`);

    const serviceId = patch.serviceId ?? cur.serviceId;
    let durationMin = cur.durationMin;
    let priceNgn = cur.priceNgn;
    let serviceName = cur.serviceName;
    if (patch.serviceId && patch.serviceId !== cur.serviceId) {
      const [svc] = await tx.select().from(services).where(eq(services.id, patch.serviceId));
      if (!svc) throw new BookingError("Service not found", 404);
      durationMin = svc.durationMin;
      priceNgn = svc.priceNgn;
      serviceName = svc.name;
    }
    const barberId = patch.barberId ?? cur.barberId;
    const startMin = patch.startMin ?? cur.startMin;
    const scheduleChanged =
      date !== cur.date || startMin !== cur.startMin || barberId !== cur.barberId || durationMin !== cur.durationMin;

    let barberName = cur.barberName;
    if (scheduleChanged) {
      const ctx = await loadContext(date, date, tx as unknown as Db);
      const slots = computeSlots(ctx, date, durationMin, barberId, id);
      if (!slots.some((s) => s.start === startMin && barberId && s.barberIds.includes(barberId))) {
        throw new BookingError("That slot is not available for the selected barber.", 409);
      }
      barberName = ctx.barbers.find((b) => b.id === barberId)?.name ?? barberName;
    }
    const [row] = await tx
      .update(bookings)
      .set({
        serviceId,
        serviceName,
        durationMin,
        priceNgn,
        barberId,
        barberName,
        date,
        startMin,
        endMin: startMin + durationMin,
        customerName: patch.customerName ?? cur.customerName,
        customerPhone: patch.customerPhone ?? cur.customerPhone,
        customerEmail: (patch.customerEmail ?? cur.customerEmail).toLowerCase(),
        notes: patch.notes ?? cur.notes,
        rescheduleRequest:
          scheduleChanged && cur.rescheduleRequest
            ? { ...cur.rescheduleRequest, status: "resolved" as const }
            : cur.rescheduleRequest,
      })
      .where(eq(bookings.id, id))
      .returning();
    return row;
  });
}
