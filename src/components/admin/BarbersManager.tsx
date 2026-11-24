"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { ImageField, Modal, PageTitle, Toggle, WeekHoursEditor } from "@/components/admin/AdminUI";
import { api } from "@/lib/client";
import { workingSummary } from "@/lib/hours";
import { defaultWeek } from "@/lib/week";
import { fmtDate } from "@/lib/time";
import type { WeekHours } from "@/lib/types";

type B = { id: string; name: string; bio: string; specialties: string[]; photoUrl: string; workingHours: WeekHours; unavailableDates: string[]; active: boolean; sortOrder: number };
const blank = (): Omit<B, "id"> => ({ name: "", bio: "", specialties: [], photoUrl: "", workingHours: defaultWeek(), unavailableDates: [], active: true, sortOrder: 0 });

export function BarbersManager({ barbers }: { barbers: B[] }) {
  const router = useRouter();
  const toast = useToast();
  const [ed, setEd] = useState<null | (Partial<B> & Omit<B, "id">)>(null);
  const [spec, setSpec] = useState("");
  const [off, setOff] = useState("");
  const [busy, setBusy] = useState(false);

  const open = (b: (Partial<B> & Omit<B, "id">) | null) => {
    setEd(b);
    setSpec(b?.specialties.join(", ") ?? "");
    setOff("");
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!ed) return;
    setBusy(true);
    try {
      const { id, ...rest } = ed;
      const body = { ...rest, specialties: spec.split(",").map((s) => s.trim()).filter(Boolean) };
      if (id) await api(`/api/admin/barbers/${id}`, "PATCH", body);
      else await api("/api/admin/barbers", "POST", body);
      toast(id ? "Barber updated." : "Barber added.");
      setEd(null);
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(b: B) {
    if (!confirm(`Delete ${b.name}? You can deactivate instead to keep history.`)) return;
    try {
      await api(`/api/admin/barbers/${b.id}`, "DELETE");
      toast("Barber deleted.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  return (
    <>
      <PageTitle title="Barbers" sub="Profiles, weekly working hours and days off. A barber's availability is also limited by business hours, holidays and breaks." action={<button onClick={() => open({ ...blank(), sortOrder: barbers.length + 1 })} className="btn btn-primary"><Plus className="h-4 w-4" /> Add barber</button>} />
      <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {barbers.map((b) => (
          <li key={b.id} className={`border border-espresso/20 bg-white p-3 ${b.active ? "" : "opacity-60"}`}>
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {b.photoUrl ? <img src={b.photoUrl} alt="" className="h-28 w-24 shrink-0 object-cover object-top" /> : <div className="h-28 w-24 shrink-0 bg-mist" />}
              <div className="min-w-0 flex-1">
                <h3 className="display text-lg">{b.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-espresso/70">{b.bio}</p>
                <p className="mt-2 text-[0.68rem] text-espresso/60">{workingSummary(b.workingHours).split(" · ").length} working days{b.unavailableDates.length ? ` · ${b.unavailableDates.length} day(s) off` : ""}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-espresso/10 pt-3">
              {!b.active && <span className="eyebrow text-espresso/60">Inactive</span>}
              <button onClick={() => open(b)} className="btn btn-outline btn-sm ml-auto"><Pencil className="h-3.5 w-3.5" /> Edit</button>
              <button onClick={() => remove(b)} className="btn btn-outline btn-sm" aria-label={`Delete ${b.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </li>
        ))}
      </ul>

      {ed && (
        <Modal title={ed.id ? "Edit barber" : "Add barber"} onClose={() => setEd(null)} wide>
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="b-name">Name</label><input id="b-name" required className="field" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} /></div>
              <div><label className="label" htmlFor="b-spec">Specialties (comma separated)</label><input id="b-spec" className="field" value={spec} onChange={(e) => setSpec(e.target.value)} /></div>
            </div>
            <div><label className="label" htmlFor="b-bio">Short biography</label><textarea id="b-bio" rows={3} maxLength={600} className="field" value={ed.bio} onChange={(e) => setEd({ ...ed, bio: e.target.value })} /></div>
            <ImageField label="Profile picture" value={ed.photoUrl} onChange={(url) => setEd({ ...ed, photoUrl: url })} />
            <div><span className="label">Weekly working hours</span><WeekHoursEditor value={ed.workingHours} onChange={(v) => setEd({ ...ed, workingHours: v })} /></div>
            <div>
              <span className="label">Unavailable days (leave, sickness…)</span>
              <div className="flex gap-2"><input type="date" aria-label="Add unavailable date" className="field !w-auto" value={off} onChange={(e) => setOff(e.target.value)} /><button type="button" className="btn btn-outline btn-sm" onClick={() => { if (off && !ed.unavailableDates.includes(off)) setEd({ ...ed, unavailableDates: [...ed.unavailableDates, off].sort() }); setOff(""); }}>Add day off</button></div>
              <ul className="mt-3 flex flex-wrap gap-2">
                {ed.unavailableDates.map((d) => (
                  <li key={d} className="flex items-center gap-1.5 border border-espresso/30 bg-white px-2 py-1 text-xs">{fmtDate(d, true)}<button type="button" aria-label={`Remove ${d}`} onClick={() => setEd({ ...ed, unavailableDates: ed.unavailableDates.filter((x) => x !== d) })}><X className="h-3 w-3" /></button></li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={ed.active} onChange={(v) => setEd({ ...ed, active: v })} label="Active (bookable)" />
              <div className="flex items-center gap-2 text-sm"><label htmlFor="b-ord">Order</label><input id="b-ord" type="number" className="field !w-20 !py-1.5" value={ed.sortOrder} onChange={(e) => setEd({ ...ed, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <button disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save barber"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
