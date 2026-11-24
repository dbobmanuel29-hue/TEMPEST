"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { ImageField, Modal, PageTitle, Toggle } from "@/components/admin/AdminUI";
import { api } from "@/lib/client";
import { fmtDuration, formatNaira } from "@/lib/time";

type Svc = { id: string; name: string; shortDescription: string; description: string; includes: string[]; priceNgn: number; durationMin: number; imageUrl: string; active: boolean; sortOrder: number };

const blank: Omit<Svc, "id"> = { name: "", shortDescription: "", description: "", includes: [], priceNgn: 5000, durationMin: 30, imageUrl: "", active: true, sortOrder: 0 };

export function ServicesManager({ services }: { services: Svc[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<null | (Partial<Svc> & Omit<Svc, "id">)>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      const { id, ...body } = editing;
      if (id) await api(`/api/admin/services/${id}`, "PATCH", body);
      else await api("/api/admin/services", "POST", body);
      toast(id ? "Service updated." : "Service added.");
      setEditing(null);
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(s: Svc) {
    if (!confirm(`Delete “${s.name}”? Past bookings keep their details. Consider disabling instead.`)) return;
    try {
      await api(`/api/admin/services/${s.id}`, "DELETE");
      toast("Service deleted.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  async function toggle(s: Svc, active: boolean) {
    try {
      await api(`/api/admin/services/${s.id}`, "PATCH", { active });
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  return (
    <>
      <PageTitle title="Services" sub="Edit prices, durations and photos. Disabled services disappear from the website and booking." action={<button onClick={() => setEditing({ ...blank, sortOrder: services.length + 1 })} className="btn btn-primary"><Plus className="h-4 w-4" /> Add service</button>} />
      <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {services.map((s) => (
          <li key={s.id} className={`flex gap-4 border border-espresso/20 bg-white p-3 ${s.active ? "" : "opacity-60"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.imageUrl ? <img src={s.imageUrl} alt="" className="h-28 w-24 shrink-0 object-cover" /> : <div className="h-28 w-24 shrink-0 bg-mist" />}
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="display text-lg">{s.name}</h3>
              <p className="text-sm font-semibold text-cobalt">{formatNaira(s.priceNgn)} <span className="font-normal text-espresso/60">· {fmtDuration(s.durationMin)}</span></p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                <Toggle checked={s.active} onChange={(v) => toggle(s, v)} label={s.active ? "On" : "Off"} />
                <button onClick={() => setEditing(s)} className="btn btn-outline btn-sm ml-auto" aria-label={`Edit ${s.name}`}><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(s)} className="btn btn-outline btn-sm" aria-label={`Delete ${s.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <Modal title={editing.id ? "Edit service" : "Add service"} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="space-y-4">
            <div><label className="label" htmlFor="s-name">Name</label><input id="s-name" required className="field" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="s-short">Short description</label><input id="s-short" maxLength={200} className="field" value={editing.shortDescription} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} /></div>
            <div><label className="label" htmlFor="s-desc">Full description</label><textarea id="s-desc" rows={3} className="field" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div><label className="label" htmlFor="s-inc">What&apos;s included (one per line)</label><textarea id="s-inc" rows={3} className="field" value={editing.includes.join("\n")} onChange={(e) => setEditing({ ...editing, includes: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label" htmlFor="s-price">Starting price (₦)</label><input id="s-price" type="number" min={0} required className="field" value={editing.priceNgn} onChange={(e) => setEditing({ ...editing, priceNgn: Number(e.target.value) })} /></div>
              <div><label className="label" htmlFor="s-dur">Duration (minutes)</label><input id="s-dur" type="number" min={5} step={5} required className="field" value={editing.durationMin} onChange={(e) => setEditing({ ...editing, durationMin: Number(e.target.value) })} /></div>
              <div><label className="label" htmlFor="s-ord">Display order</label><input id="s-ord" type="number" className="field" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} /></div>
            </div>
            <ImageField label="Service photograph" value={editing.imageUrl} onChange={(url) => setEditing({ ...editing, imageUrl: url })} />
            <Toggle checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} label="Enabled (visible & bookable)" />
            <button disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Save service"}</button>
          </form>
        </Modal>
      )}
    </>
  );
}
