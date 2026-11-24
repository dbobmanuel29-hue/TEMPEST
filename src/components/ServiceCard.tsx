import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { fmtDuration, formatNaira } from "@/lib/time";

type S = { id: string; slug: string; name: string; shortDescription: string; priceNgn: number; durationMin: number; imageUrl: string };

export function ServiceCard({ s, delay = 0 }: { s: S; delay?: number }) {
  return (
    <article data-reveal style={{ "--d": `${delay}ms` } as React.CSSProperties} className="group flex flex-col">
      <Link href={`/services/${s.slug}`} className="img-zoom relative block aspect-[4/5] overflow-hidden rounded-md bg-mist">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={s.imageUrl} alt={s.name} loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-espresso/75 to-transparent" />
        <span className="absolute left-4 top-4 flex items-center gap-1.5 bg-cream px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]">
          <Clock className="h-3 w-3" /> {fmtDuration(s.durationMin)}
        </span>
        <span className="absolute inset-x-4 bottom-4 text-cream">
          <span className="display block text-2xl">{s.name}</span>
          <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-sand">From {formatNaira(s.priceNgn)}</span>
        </span>
      </Link>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-espresso/75">{s.shortDescription}</p>
      <div className="mt-4 flex gap-2">
        <Link href={`/services/${s.slug}`} className="btn btn-outline btn-sm flex-1">
          View <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <Link href={`/book?service=${s.id}`} className="btn btn-primary btn-sm flex-1">Book</Link>
      </div>
    </article>
  );
}
