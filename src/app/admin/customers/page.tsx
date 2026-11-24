import { desc, eq, or } from "drizzle-orm";
import { StatusBadge } from "@/components/BookingCard";
import { PageTitle } from "@/components/admin/AdminUI";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { fmtDate, fmtMin, formatNaira } from "@/lib/time";

export default async function AdminCustomers() {
  const customers = await db.select().from(users).where(eq(users.role, "customer")).orderBy(desc(users.createdAt)).limit(300);
  const all = await db.select().from(bookings).orderBy(desc(bookings.date), desc(bookings.startMin));
  const of = (u: (typeof customers)[number]) => all.filter((b) => b.userId === u.id || b.customerEmail === u.email);
  void or;

  return (
    <>
      <PageTitle title="Customers" sub="Registered customers and their appointment history. Guest bookings appear under Bookings." />
      <ul className="space-y-3">
        {customers.map((u) => {
          const bs = of(u);
          const spent = bs.filter((b) => b.status === "completed").reduce((a, b) => a + b.priceNgn, 0);
          return (
            <li key={u.id} className="border border-espresso/20 bg-white">
              <details>
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <span className="min-w-0"><strong className="block">{u.name}</strong><span className="text-espresso/70">{u.email}{u.phone ? ` · ${u.phone}` : ""}</span></span>
                  <span className="text-xs text-espresso/70">{bs.length} booking{bs.length === 1 ? "" : "s"} · {formatNaira(spent)} completed · joined {fmtDate(u.createdAt.toISOString().slice(0, 10), true)}</span>
                </summary>
                <div className="border-t border-espresso/10 p-4">
                  {bs.length ? (
                    <ul className="divide-y divide-espresso/10 text-sm">
                      {bs.map((b) => (
                        <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                          <span>{fmtDate(b.date, true)} · {fmtMin(b.startMin)} — {b.serviceName} with {b.barberName} <span className="text-espresso/50">({b.reference})</span></span>
                          <StatusBadge status={b.status} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-espresso/60">No bookings yet.</p>}
                </div>
              </details>
            </li>
          );
        })}
        {!customers.length && <li className="border border-dashed border-espresso/40 p-8 text-center text-sm">No registered customers yet.</li>}
      </ul>
    </>
  );
}
