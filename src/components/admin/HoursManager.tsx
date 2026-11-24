"use client";

import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { PageTitle, Toggle, WeekHoursEditor } from "@/components/admin/AdminUI";
import { api } from "@/lib/client";
import { fmtDate } from "@/lib/time";
import type { BusinessSettings } from "@/lib/types";

export function HoursManager({ initial }: { initial: BusinessSettings }) {
  const router = useRouter();
  const toast = useToast();
  const [b, setB] = useState(initial);
  const [cl, setCl] = useState({ start: "", end: "", label: "", type: "holiday" as "holiday" | "special" });
  const [busy, setBusy] = useState(false);
  const num = (k: keyof BusinessSettings) => (e: React.ChangeEvent<HTMLInputElement>) => setB({ ...b, [k]: Number(e.target.value) });

  async function save() {
    setBusy(true);
    try {
      await api("/api/admin/settings", "PUT", { key: "business", value: b });
      toast("Business hours saved.");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Business hours" sub="Controls which dates and times customers can book. All times are Africa/Lagos." action={<button onClick={save} disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save changes"}</button>} />
      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <h2 className="display mb-3 text-xl">Opening hours & working days</h2>
          <WeekHoursEditor value={b.hours} onChange={(hours) => setB({ ...b, hours })} />

          <h2 className="display mb-3 mt-10 text-xl">Break periods</h2>
          <p className="mb-3 text-xs text-espresso/60">No appointments can overlap a break (applies every open day).</p>
          <ul className="space-y-2">
            {b.breaks.map((br, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 border border-espresso/20 bg-white p-2">
                <input aria-label="Break label" className="field !w-40 !py-1.5" value={br.label} onChange={(e) => setB({ ...b, breaks: b.breaks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                <input type="time" aria-label="Break start" className="field !w-auto !py-1.5" value={br.start} onChange={(e) => setB({ ...b, breaks: b.breaks.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)) })} />
                <span>–</span>
                <input type="time" aria-label="Break end" className="field !w-auto !py-1.5" value={br.end} onChange={(e) => setB({ ...b, breaks: b.breaks.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)) })} />
                <button aria-label="Remove break" className="ml-auto p-1" onClick={() => setB({ ...b, breaks: b.breaks.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
          <button className="btn btn-outline btn-sm mt-3" onClick={() => setB({ ...b, breaks: [...b.breaks, { label: "Break", start: "13:00", end: "14:00" }] })}><Plus className="h-3.5 w-3.5" /> Add break</button>
        </section>

        <section>
          <h2 className="display mb-3 text-xl">Holidays & special closures</h2>
          <div className="grid gap-2 border border-espresso/20 bg-white p-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="c-s">From</label><input id="c-s" type="date" className="field" value={cl.start} onChange={(e) => setCl({ ...cl, start: e.target.value, end: cl.end || e.target.value })} /></div>
            <div><label className="label" htmlFor="c-e">To</label><input id="c-e" type="date" className="field" value={cl.end} min={cl.start} onChange={(e) => setCl({ ...cl, end: e.target.value })} /></div>
            <div><label className="label" htmlFor="c-l">Label</label><input id="c-l" className="field" placeholder="e.g. Public holiday" value={cl.label} onChange={(e) => setCl({ ...cl, label: e.target.value })} /></div>
            <div><label className="label" htmlFor="c-t">Type</label><select id="c-t" className="field" value={cl.type} onChange={(e) => setCl({ ...cl, type: e.target.value as "holiday" | "special" })}><option value="holiday">Holiday</option><option value="special">Special closure</option></select></div>
            <button className="btn btn-dark btn-sm sm:col-span-2" onClick={() => { if (!cl.start || !cl.end) return toast("Choose start and end dates.", "error"); setB({ ...b, closures: [...b.closures, { id: crypto.randomUUID(), ...cl, label: cl.label || (cl.type === "holiday" ? "Holiday" : "Closed") }].sort((x, y) => x.start.localeCompare(y.start)) }); setCl({ start: "", end: "", label: "", type: "holiday" }); }}>Add closure</button>
          </div>
          <ul className="mt-3 space-y-2">
            {b.closures.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 border border-espresso/20 bg-white p-3 text-sm">
                <span><strong>{c.label}</strong> <span className="text-espresso/60">({c.type})</span><br />{fmtDate(c.start, true)}{c.end !== c.start && ` → ${fmtDate(c.end, true)}`}</span>
                <button aria-label="Remove closure" onClick={() => setB({ ...b, closures: b.closures.filter((x) => x.id !== c.id) })}><X className="h-4 w-4" /></button>
              </li>
            ))}
            {!b.closures.length && <li className="text-sm text-espresso/60">No closures scheduled.</li>}
          </ul>

          <h2 className="display mb-3 mt-10 text-xl">Booking rules</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="r-i">Slot interval (min)</label><input id="r-i" type="number" min={5} className="field" value={b.slotInterval} onChange={num("slotInterval")} /></div>
            <div><label className="label" htmlFor="r-l">Minimum notice (min)</label><input id="r-l" type="number" min={0} className="field" value={b.leadTimeMinutes} onChange={num("leadTimeMinutes")} /></div>
            <div><label className="label" htmlFor="r-m">Book up to (days ahead)</label><input id="r-m" type="number" min={1} className="field" value={b.maxAdvanceDays} onChange={num("maxAdvanceDays")} /></div>
            <div><label className="label" htmlFor="r-c">Free cancellation (hours before)</label><input id="r-c" type="number" min={0} className="field" value={b.cancelHoursBefore} onChange={num("cancelHoursBefore")} /></div>
          </div>
          <div className="mt-4"><Toggle checked={b.autoConfirm} onChange={(v) => setB({ ...b, autoConfirm: v })} label="Auto-confirm new bookings (otherwise they start as Pending)" /></div>
        </section>
      </div>
    </>
  );
}
