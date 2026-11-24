"use client";

import { CalendarClock, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { fmtDate, fmtDuration, fmtMin, formatNaira, nowLagos } from "@/lib/time";

export type BookingView = {
  id: string;
  reference: string;
  serviceName: string;
  barberName: string;
  date: string;
  startMin: number;
  durationMin: number;
  priceNgn: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  amountDueNgn: number;
  notes: string;
  customerName: string;
  rescheduleRequest: { date: string; startMin: number | null; note: string; status: "open" | "resolved" } | null;
};
export type Policy = { open: boolean; canCancel: boolean; canReschedule: boolean };

export const STATUS_STYLE: Record<string, string> = {
  pending: "bg-sand text-espresso border-espresso/40",
  confirmed: "bg-cobalt text-white border-cobalt",
  completed: "bg-espresso text-cream border-espresso",
  cancelled: "bg-transparent text-espresso/60 border-espresso/30 line-through",
  no_show: "bg-transparent text-espresso/60 border-espresso/30",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block border px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] ${STATUS_STYLE[status] ?? ""}`}>{status.replace("_", " ")}</span>;
}

export function BookingCard({
  booking,
  policy,
  email,
  cancelHours,
  onChange,
}: {
  booking: BookingView;
  policy: Policy;
  email?: string;
  cancelHours: number;
  onChange?: (b: BookingView) => void;
}) {
  const toast = useToast();
  const [b, setB] = useState(booking);
  const [pol, setPol] = useState(policy);
  const [panel, setPanel] = useState<null | "reschedule" | "cancel">(null);
  const [busy, setBusy] = useState(false);
  const [rs, setRs] = useState({ date: "", time: "", note: "" });

  const update = (nb: BookingView) => {
    setB(nb);
    setPol((p) => ({ ...p, open: nb.status === "pending" || nb.status === "confirmed" }));
    onChange?.(nb);
  };

  async function cancel() {
    setBusy(true);
    try {
      const r = await api<{ booking: BookingView }>(`/api/bookings/${b.reference}/cancel`, "POST", { email });
      update(r.booking);
      setPol({ open: false, canCancel: false, canReschedule: false });
      setPanel(null);
      toast("Your appointment has been cancelled.");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function reschedule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const startMin = rs.time ? Number(rs.time.split(":")[0]) * 60 + Number(rs.time.split(":")[1]) : null;
      const r = await api<{ booking: BookingView }>(`/api/bookings/${b.reference}/reschedule`, "POST", { email, date: rs.date, startMin, note: rs.note });
      update(r.booking);
      setPanel(null);
      toast("Reschedule request sent. We'll confirm the new time with you.");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  const req = b.rescheduleRequest?.status === "open" ? b.rescheduleRequest : null;

  return (
    <article className="border border-espresso/25 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-espresso/55">{b.reference}</p>
          <h3 className="display mt-1 text-2xl">{b.serviceName}</h3>
        </div>
        <StatusBadge status={b.status} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div><dt className="eyebrow text-espresso/55">When</dt><dd className="mt-0.5 font-medium">{fmtDate(b.date, true)} · {fmtMin(b.startMin)}</dd></div>
        <div><dt className="eyebrow text-espresso/55">Barber</dt><dd className="mt-0.5 font-medium">{b.barberName}</dd></div>
        <div><dt className="eyebrow text-espresso/55">Total · {fmtDuration(b.durationMin)}</dt><dd className="mt-0.5 font-medium">{formatNaira(b.priceNgn)} <span className="text-xs text-espresso/60">({b.paymentStatus})</span></dd></div>
      </dl>
      {req && (
        <p className="mt-4 border-l-4 border-cobalt bg-cream p-3 text-xs">
          Reschedule requested for {fmtDate(req.date, true)}{req.startMin !== null ? ` around ${fmtMin(req.startMin)}` : ""} — awaiting confirmation.
        </p>
      )}

      {pol.open && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => setPanel(panel === "reschedule" ? null : "reschedule")} disabled={!pol.canReschedule} className="btn btn-outline btn-sm"><CalendarClock className="h-3.5 w-3.5" /> Request reschedule</button>
          <button onClick={() => setPanel(panel === "cancel" ? null : "cancel")} className="btn btn-outline btn-sm"><X className="h-3.5 w-3.5" /> Cancel</button>
        </div>
      )}

      {panel === "cancel" && (
        <div className="mt-4 border border-espresso/20 bg-cream p-4 text-sm" style={{ animation: "pop 0.2s ease" }}>
          {pol.canCancel ? (
            <>
              <p>Cancel this appointment? This frees the slot for other customers.</p>
              <div className="mt-3 flex gap-2">
                <button onClick={cancel} disabled={busy} className="btn btn-dark btn-sm">{busy ? "Cancelling…" : "Yes, cancel it"}</button>
                <button onClick={() => setPanel(null)} className="btn btn-outline btn-sm">Keep it</button>
              </div>
            </>
          ) : (
            <p>Online cancellation closes {cancelHours} hours before the appointment. Please contact the shop directly and we&apos;ll do our best to help.</p>
          )}
        </div>
      )}

      {panel === "reschedule" && (
        <form onSubmit={reschedule} className="mt-4 space-y-3 border border-espresso/20 bg-cream p-4" style={{ animation: "pop 0.2s ease" }}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor={`rd-${b.id}`}>Preferred date</label><input id={`rd-${b.id}`} type="date" required min={nowLagos().date} className="field" value={rs.date} onChange={(e) => setRs({ ...rs, date: e.target.value })} /></div>
            <div><label className="label" htmlFor={`rt-${b.id}`}>Preferred time (optional)</label><input id={`rt-${b.id}`} type="time" className="field" value={rs.time} onChange={(e) => setRs({ ...rs, time: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor={`rn-${b.id}`}>Note (optional)</label><input id={`rn-${b.id}`} className="field" maxLength={500} value={rs.note} onChange={(e) => setRs({ ...rs, note: e.target.value })} /></div>
          <p className="text-xs text-espresso/70">This is a request — your current slot stays reserved until we confirm a change.</p>
          <button disabled={busy} className="btn btn-primary btn-sm">{busy ? "Sending…" : "Send request"}</button>
        </form>
      )}
    </article>
  );
}
