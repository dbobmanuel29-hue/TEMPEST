import { and, desc, eq, ilike, or } from "drizzle-orm";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { PageTitle } from "@/components/admin/AdminUI";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getBarbers, getServices } from "@/lib/data";

type SP = { q?: string; date?: string; barber?: string; status?: string };

export default async function AdminBookings({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [barbers, services] = await Promise.all([getBarbers({ includeInactive: true }), getServices({ includeInactive: true })]);
  const conds = [];
  if (sp.q) {
    const like = `%${sp.q.replace(/[%_]/g, "")}%`;
    conds.push(or(ilike(bookings.customerName, like), ilike(bookings.customerEmail, like), ilike(bookings.customerPhone, like), ilike(bookings.reference, like)));
  }
  if (sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date)) conds.push(eq(bookings.date, sp.date));
  if (sp.barber && /^[0-9a-f-]{36}$/i.test(sp.barber)) conds.push(eq(bookings.barberId, sp.barber));
  if (sp.status && ["pending", "confirmed", "completed", "cancelled", "no_show"].includes(sp.status)) conds.push(eq(bookings.status, sp.status));
  const rows = await db.select().from(bookings).where(conds.length ? and(...conds) : undefined).orderBy(desc(bookings.date), desc(bookings.startMin)).limit(200);

  return (
    <>
      <PageTitle title="Bookings" sub="Search, filter and manage every appointment." />
      <BookingsManager
        rows={JSON.parse(JSON.stringify(rows))}
        barbers={barbers.map((b) => ({ id: b.id, name: b.name }))}
        services={services.map((s) => ({ id: s.id, name: s.name }))}
        filters={sp}
      />
    </>
  );
}
