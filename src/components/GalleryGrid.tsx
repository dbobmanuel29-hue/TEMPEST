"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GALLERY, GALLERY_CATEGORIES, px } from "@/lib/media";

const RATIO = { tall: "aspect-[3/4]", square: "aspect-square", wide: "aspect-[4/3]" } as const;

export function GalleryGrid() {
  const [cat, setCat] = useState<string>("All");
  const [active, setActive] = useState<number | null>(null);
  const items = GALLERY.filter((g) => cat === "All" || g.category === cat);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((d: number) => setActive((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step]);

  const current = active !== null ? items[active] : null;

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Filter by style">
        {["All", ...GALLERY_CATEGORIES].map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`shrink-0 border px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] transition ${
              cat === c ? "border-cobalt bg-cobalt text-white" : "border-espresso/40 hover:border-espresso hover:bg-espresso hover:text-cream"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {items.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setActive(i)}
            className="img-zoom group relative block w-full break-inside-avoid overflow-hidden rounded-md bg-mist text-left"
            aria-label={`Open: ${g.alt}`}
          >
            <div className={RATIO[g.ratio]}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={px(g.id, 700)} alt={g.alt} loading="lazy" className="h-full w-full object-cover" />
            </div>
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-espresso/85 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cream transition-transform duration-300 group-hover:translate-y-0">
              {g.category}
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-espresso/95 p-4" role="dialog" aria-modal="true" aria-label={current.alt} onClick={close} style={{ animation: "pop 0.2s ease" }}>
          <button aria-label="Close" onClick={close} className="absolute right-4 top-4 rounded p-2 text-cream hover:bg-cream/10">
            <X className="h-6 w-6" />
          </button>
          <button aria-label="Previous image" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-2 text-cream hover:bg-cream/10 md:left-6">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={px(current.id, 1600)} alt={current.alt} className="max-h-[80vh] w-auto max-w-full object-contain" />
            <figcaption className="mt-3 flex items-center justify-between text-sm text-cream">
              <span>{current.alt}</span>
              <span className="eyebrow text-sand">{current.category}</span>
            </figcaption>
          </figure>
          <button aria-label="Next image" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 text-cream hover:bg-cream/10 md:right-6">
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  );
}
