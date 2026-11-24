"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast";
import { uploadImage } from "@/lib/client";
import { DAY_NAMES } from "@/lib/time";
import type { WeekHours } from "@/lib/types";

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-espresso/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={`max-h-[92vh] w-full overflow-y-auto bg-cream p-5 shadow-2xl sm:p-7 ${wide ? "sm:max-w-3xl" : "sm:max-w-xl"}`} onClick={(e) => e.stopPropagation()} style={{ animation: "pop 0.2s ease" }}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="display text-2xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-sand"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-cobalt" : "bg-espresso/30"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
      <span>{label}</span>
    </label>
  );
}

export function ImageField({ value, onChange, label = "Photo" }: { value: string; onChange: (url: string) => void; label?: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-24 w-20 object-cover" />
        ) : (
          <span className="flex h-24 w-20 items-center justify-center bg-mist"><ImagePlus className="h-6 w-6 text-espresso/40" /></span>
        )}
        <label className="btn btn-outline btn-sm cursor-pointer">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try {
                onChange(await uploadImage(file));
                toast("Image uploaded.");
              } catch (err) {
                toast((err as Error).message, "error");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      <p className="mt-1 text-xs text-espresso/60">JPG, PNG or WebP, up to 2 MB.</p>
    </div>
  );
}

/** Opening / working hours for each weekday (Monday first). */
export function WeekHoursEditor({ value, onChange }: { value: WeekHours; onChange: (v: WeekHours) => void }) {
  const set = (d: number, patch: Partial<WeekHours[string]>) =>
    onChange({ ...value, [d]: { ...(value[String(d)] ?? { open: false, start: "09:00", end: "18:00" }), ...patch } });
  return (
    <div className="divide-y divide-espresso/15 border border-espresso/20 bg-white">
      {[1, 2, 3, 4, 5, 6, 0].map((d) => {
        const h = value[String(d)] ?? { open: false, start: "09:00", end: "18:00" };
        return (
          <div key={d} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3">
            <div className="w-28"><Toggle checked={h.open} onChange={(v) => set(d, { open: v })} label={DAY_NAMES[d].slice(0, 3)} /></div>
            {h.open ? (
              <div className="flex items-center gap-2 text-sm">
                <input type="time" aria-label={`${DAY_NAMES[d]} start`} value={h.start} onChange={(e) => set(d, { start: e.target.value })} className="field !w-auto !py-1.5" />
                <span>to</span>
                <input type="time" aria-label={`${DAY_NAMES[d]} end`} value={h.end} onChange={(e) => set(d, { end: e.target.value })} className="field !w-auto !py-1.5" />
              </div>
            ) : (
              <span className="text-sm text-espresso/50">Closed / off</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-3xl md:text-4xl">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-sm text-espresso/70">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
