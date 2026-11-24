import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { StatusBadge } from "@/components/BookingCard";
import { PageTitle } from "@/components/admin/AdminUI";
import { db } from "@/db";
import { bookings, payments } from "@/db/schema";
import { fmtDate, fmtMin, formatNaira, nowLagos } from "@/lib/time";

export default async function AdminOverview() {
  const today = nowLagos().date;
  const monthStart = `${today.slice(0, 7)}-01`;
  const byStatus = await db.select({ status: bookings.status, n: count() }).from(bookings).groupBy(bookings.status);
  const n = (s: string) => byStatus.find((x) => x.status === s)?.n ?? 0;
  const total = byStatus.reduce((a, b) => a + b.n, 0);
  const [{ n: todayN }] = await db.select({ n: count() }).from(bookings).where(and(eq(bookings.date, today), sql`${bookings.status} in ('pending','confirmed','completed')`));
  const [rev] = await db.select({ all: sql<number>`coalesce(sum(${payments.amountNgn}),0)::int`, month: sql<number>`coalesce(sum(${payments.amountNgn}) filter (where ${payments.createdAt} >= ${monthStart}::date),0)::int` }).from(payments).where(eq(payments.status, "success"));
  const byProvider = await db.select({ provider: payments.provider, total: sql<number>`sum(${payments.amountNgn})::int` }).from(payments).where(eq(payments.status, "success")).groupBy(payments.provider);
  const upcoming = await db.select().from(bookings).where(and(gte(bookings.date, today), sql`${bookings.status} in ('pending','confirmed')`)).orderBy(asc(bookings.date), asc(bookings.startMin)).limit(8);
  const requests = await db.select().from(bookings).where(sql`${bookings.rescheduleRequest}->>'status' = 'open'`).orderBy(desc(bookings.date)).limit(10);

  const stats = [
    ["Total bookings", total], ["Today's appointments", todayN], ["Pending", n("pending")], ["Completed", n("completed")], ["Cancelled", n("cancelled")], ["No-shows", n("no_show")],
  ] as const;

  return (
    <>
      <PageTitle title="Overview" sub={`Today is ${fmtDate(today)} (Africa/Lagos).`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(([l, v]) => (
          <div key={l} className="border border-espresso/20 bg-white p-4">
            <p className="eyebrow text-espresso/60">{l}</p>
            <p className="display mt-2 text-4xl">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="border border-espresso/20 bg-espresso p-6 text-cream">
          <p className="eyebrow text-sand">Revenue (recorded payments)</p>
          <p className="display mt-3 text-4xl">{formatNaira(rev.all)}</p>
          <p className="mt-1 text-sm text-cream/70">{formatNaira(rev.month)} this month</p>
          <ul className="mt-5 space-y-1 border-t border-cream/20 pt-4 text-sm">
            {byProvider.map((p) => <li key={p.provider} className="flex justify-between"><span className="capitalize">{p.provider.replace("_", " ")}</span><span>{formatNaira(p.total)}</span></li>)}
            {!byProvider.length && <li className="text-cream/60">No payments recorded yet. Record payments from a booking.</li>}
          </ul>
        </div>

        <div className="border border-espresso/20 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="display text-xl">Next appointments</h2><Link href="/admin/bookings" className="eyebrow text-cobalt hover:underline">All bookings</Link></div>
          <ul className="mt-4 divide-y divide-espresso/10">
            {upcoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span><strong>{fmtDate(b.date, true)} · {fmtMin(b.startMin)}</strong><br /><span className="text-espresso/70">{b.customerName} — {b.serviceName} with {b.barberName}</span></span>
                <StatusBadge status={b.status} />
              </li>
            ))}
            {!upcoming.length && <li className="py-3 text-sm text-espresso/60">No upcoming appointments.</li>}
          </ul>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="mt-6 border-l-4 border-cobalt bg-white p-6">
          <h2 className="display text-xl">Reschedule requests</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {requests.map((b) => (
              <li key={b.id}>
                <Link href={`/admin/bookings?q=${b.reference}`} className="hover:underline"><strong>{b.reference}</strong> · {b.customerName} wants {fmtDate(b.rescheduleRequest!.date, true)}{b.rescheduleRequest!.startMin !== null ? ` ~${fmtMin(b.rescheduleRequest!.startMin)}` : ""} (currently {fmtDate(b.date, true)})</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
