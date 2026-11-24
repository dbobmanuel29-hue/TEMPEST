"use client";

import { Pencil, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/BookingCard";
import { useToast } from "@/components/Toast";
import { Modal } from "@/components/admin/AdminUI";
import { api } from "@/lib/client";
import { fmtDate, fmtMin, formatNaira } from "@/lib/time";

type Row = {
  id: string; reference: string; serviceId: string | null; serviceName: string; barberId: string | null; barberName: string;
  customerName: string; customerPhone: string; customerEmail: string; notes: string; date: string; startMin: number; durationMin: number;
  priceNgn: number; status: string; paymentMethod: string; paymentStatus: string; amountDueNgn: number;
  rescheduleRequest: { date: string; startMin: number | null; note: string; status: string } | null;
};
type Opt = { id: string; name: string };

export function BookingsManager({ rows, barbers, services, filters }: { rows: Row[]; barbers: Opt[]; services: Opt[]; filters: { q?: string; date?: string; barber?: string; status?: string } }) {
  const router = useRouter();
  const toast = useToast();
  const [edit, setEdit] = useState<Row | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = new URLSearchParams();
    for (const [k, v] of fd.entries()) if (v) p.set(k, String(v));
    router.push(`/admin/bookings?${p}`);
  }

  async function act(id: string, action: string) {
    setBusyId(id);
    try {
      await api(`/api/admin/bookings/${id}`, "PATCH", { action });
      toast("Booking updated.");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <form onSubmit={applyFilters} className="mb-6 grid gap-3 border border-espresso/20 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso/50" /><input name="q" defaultValue={filters.q} placeholder="Search name, email, phone, reference" aria-label="Search bookings" className="field !pl-9" /></div>
        <input type="date" name="date" defaultValue={filters.date} aria-label="Filter by date" className="field" />
        <select name="barber" defaultValue={filters.barber ?? ""} aria-label="Filter by barber" className="field"><option value="">All barbers</option>{barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select name="status" defaultValue={filters.status ?? ""} aria-label="Filter by status" className="field"><option value="">All statuses</option>{["pending", "confirmed", "completed", "cancelled", "no_show"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
        <div className="flex gap-2"><button className="btn btn-dark btn-sm flex-1">Filter</button><button type="button" onClick={() => router.push("/admin/bookings")} className="btn btn-outline btn-sm">Reset</button></div>
      </form>

      <p className="mb-3 text-xs text-espresso/60">{rows.length} booking{rows.length === 1 ? "" : "s"}{rows.length === 200 ? " (showing latest 200)" : ""}</p>

      <div className="hidden grid-cols-[1.1fr_1.4fr_1.2fr_.8fr_.8fr_auto] gap-4 border-b-2 border-espresso px-4 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] lg:grid">
        <span>When</span><span>Customer</span><span>Service / barber</span><span>Status</span><span>Payment</span><span>Actions</span>
      </div>
      <ul className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-espresso/15">
        {rows.map((b) => {
          const live = b.status === "pending" || b.status === "confirmed";
          return (
            <li key={b.id} className="grid gap-3 border border-espresso/20 bg-white p-4 lg:grid-cols-[1.1fr_1.4fr_1.2fr_.8fr_.8fr_auto] lg:items-center lg:gap-4 lg:border-0">
              <div className="text-sm"><p className="font-semibold">{fmtDate(b.date, true)}</p><p>{fmtMin(b.startMin)} – {fmtMin(b.startMin + b.durationMin)}</p><p className="text-xs text-espresso/55">{b.reference}</p></div>
              <div className="min-w-0 text-sm"><p className="font-semibold">{b.customerName}</p><p className="truncate text-espresso/70">{b.customerEmail}</p><a href={`tel:${b.customerPhone}`} className="text-espresso/70 hover:text-cobalt">{b.customerPhone}</a></div>
              <div className="text-sm"><p>{b.serviceName}</p><p className="text-espresso/70">{b.barberName}</p>{b.notes && <p className="mt-1 text-xs italic text-espresso/60">“{b.notes}”</p>}</div>
              <div className="space-y-1.5"><StatusBadge status={b.status} />{b.rescheduleRequest?.status === "open" && <p className="text-[0.65rem] font-bold uppercase tracking-wider text-cobalt">Reschedule requested → {fmtDate(b.rescheduleRequest.date, true)}</p>}</div>
              <div className="text-sm"><p>{formatNaira(b.priceNgn)}</p><p className="text-xs capitalize text-espresso/60">{b.paymentStatus} · {b.paymentMethod.replace(/_/g, " ")}</p></div>
              <div className="flex flex-wrap gap-1.5">
                {b.status === "pending" && <button disabled={busyId === b.id} onClick={() => act(b.id, "confirm")} className="btn btn-primary btn-sm">Confirm</button>}
                {live && <button disabled={busyId === b.id} onClick={() => act(b.id, "complete")} className="btn btn-dark btn-sm">Complete</button>}
                {b.status === "confirmed" && <button disabled={busyId === b.id} onClick={() => act(b.id, "no_show")} className="btn btn-outline btn-sm">No-show</button>}
                {live && <button disabled={busyId === b.id} onClick={() => { if (confirm("Cancel this booking?")) act(b.id, "cancel"); }} className="btn btn-outline btn-sm">Cancel</button>}
                <button onClick={() => setEdit(b)} className="btn btn-outline btn-sm" aria-label={`Edit booking ${b.reference}`}><Pencil className="h-3.5 w-3.5" /> Edit</button>
              </div>
            </li>
          );
        })}
        {!rows.length && <li className="border border-dashed border-espresso/40 p-8 text-center text-sm">No bookings match these filters.</li>}
      </ul>

      {edit && <BookingEditor row={edit} barbers={barbers} services={services} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); router.refresh(); }} />}
    </div>
  );
}

function BookingEditor({ row, barbers, services, onClose, onSaved }: { row: Row; barbers: Opt[]; services: Opt[]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const [f, setF] = useState({
    serviceId: row.serviceId ?? "", barberId: row.barberId ?? "", date: row.date, time: hhmm(row.startMin),
    customerName: row.customerName, customerPhone: row.customerPhone, customerEmail: row.customerEmail, notes: row.notes,
  });
  const [pay, setPay] = useState({ amountNgn: String(Math.max(row.priceNgn - 0, 0)), provider: "cash", note: "" });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const [h, m] = f.time.split(":").map(Number);
      await api(`/api/admin/bookings/${row.id}`, "PATCH", {
        action: "edit",
        patch: { serviceId: f.serviceId || undefined, barberId: f.barberId || undefined, date: f.date, startMin: h * 60 + m, customerName: f.customerName, customerPhone: f.customerPhone, customerEmail: f.customerEmail, notes: f.notes },
      });
      toast("Booking updated.");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment() {
    setBusy(true);
    try {
      await api(`/api/admin/bookings/${row.id}/payment`, "POST", { amountNgn: Number(pay.amountNgn), provider: pay.provider, note: pay.note });
      toast("Payment recorded.");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function dismiss() {
    await api(`/api/admin/bookings/${row.id}`, "PATCH", { action: "dismiss_reschedule" }).catch(() => {});
    onSaved();
  }

  return (
    <Modal title={`Edit ${row.reference}`} onClose={onClose} wide>
      {row.rescheduleRequest?.status === "open" && (
        <div className="mb-5 border-l-4 border-cobalt bg-white p-3 text-sm">
          Customer asked for <strong>{fmtDate(row.rescheduleRequest.date, true)}</strong>{row.rescheduleRequest.startMin !== null && <> around <strong>{fmtMin(row.rescheduleRequest.startMin)}</strong></>}. {row.rescheduleRequest.note && <>“{row.rescheduleRequest.note}” </>}
          Change the date/time below and save to apply (it re-checks availability), or <button type="button" onClick={dismiss} className="underline">dismiss the request</button>.
        </div>
      )}
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="e-svc">Service</label><select id="e-svc" className="field" value={f.serviceId} onChange={(e) => setF({ ...f, serviceId: e.target.value })}>{services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div><label className="label" htmlFor="e-bar">Barber</label><select id="e-bar" className="field" value={f.barberId} onChange={(e) => setF({ ...f, barberId: e.target.value })}>{barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div><label className="label" htmlFor="e-date">Date</label><input id="e-date" type="date" className="field" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-time">Start time</label><input id="e-time" type="time" className="field" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-name">Customer name</label><input id="e-name" className="field" value={f.customerName} onChange={(e) => setF({ ...f, customerName: e.target.value })} /></div>
          <div><label className="label" htmlFor="e-phone">Phone</label><input id="e-phone" className="field" value={f.customerPhone} onChange={(e) => setF({ ...f, customerPhone: e.target.value })} /></div>
        </div>
        <div><label className="label" htmlFor="e-email">Email</label><input id="e-email" type="email" className="field" value={f.customerEmail} onChange={(e) => setF({ ...f, customerEmail: e.target.value })} /></div>
        <div><label className="label" htmlFor="e-notes">Notes</label><textarea id="e-notes" rows={2} className="field" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
        <p className="text-xs text-espresso/60">Changing the service, barber, date or time re-validates availability so double bookings can&apos;t happen.</p>
        <button disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save changes"}</button>
      </form>

      <div className="mt-8 border-t border-espresso/20 pt-6">
        <h3 className="display text-lg">Record a payment</h3>
        <p className="mb-3 mt-1 text-xs text-espresso/60">Total {formatNaira(row.priceNgn)} · status: {row.paymentStatus}. Card payments are recorded automatically after Paystack verification.</p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end">
          <div><label className="label" htmlFor="p-amt">Amount (₦)</label><input id="p-amt" type="number" min={1} className="field" value={pay.amountNgn} onChange={(e) => setPay({ ...pay, amountNgn: e.target.value })} /></div>
          <div><label className="label" htmlFor="p-prov">Method</label><select id="p-prov" className="field" value={pay.provider} onChange={(e) => setPay({ ...pay, provider: e.target.value })}><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="pos">POS</option></select></div>
          <div><label className="label" htmlFor="p-note">Note</label><input id="p-note" className="field" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} /></div>
          <button type="button" disabled={busy} onClick={recordPayment} className="btn btn-dark">Record</button>
        </div>
      </div>
    </Modal>
  );
}
