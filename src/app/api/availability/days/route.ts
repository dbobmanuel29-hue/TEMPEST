import { eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { HttpError, ok, route } from "@/lib/api";
import { monthAvailability } from "@/lib/availability";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const q = new URL(req.url).searchParams;
  const month = q.get("month") ?? "";
  const serviceId = q.get("serviceId") ?? "";
  const barber = q.get("barberId");
  if (!/^\d{4}-\d{2}$/.test(month)) throw new HttpError("Invalid month");
  const [svc] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!svc) throw new HttpError("Unknown service", 404);
  const last = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0)).getUTCDate();
  const days = await monthAvailability(`${month}-01`, `${month}-${String(last).padStart(2, "0")}`, svc.durationMin, barber && barber !== "any" ? barber : null);
  return ok({ days });
});
