import { eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { HttpError, ok, route } from "@/lib/api";
import { computeSlots, loadContext } from "@/lib/availability";
import { fmtMin, isDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const q = new URL(req.url).searchParams;
  const date = q.get("date") ?? "";
  const barber = q.get("barberId");
  if (!isDateString(date)) throw new HttpError("Invalid date");
  const [svc] = await db.select().from(services).where(eq(services.id, q.get("serviceId") ?? ""));
  if (!svc) throw new HttpError("Unknown service", 404);
  const ctx = await loadContext(date, date);
  const slots = computeSlots(ctx, date, svc.durationMin, barber && barber !== "any" ? barber : null);
  return ok({ slots: slots.map((s) => ({ start: s.start, label: fmtMin(s.start) })) });
});
