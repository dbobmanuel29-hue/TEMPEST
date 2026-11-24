import { Check, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug, getServices } from "@/lib/data";
import { fmtDuration, formatNaira } from "@/lib/time";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getServiceBySlug((await params).slug);
  if (!s) return { title: "Service not found" };
  return { title: s.name, description: s.shortDescription, openGraph: { images: s.imageUrl ? [s.imageUrl] : undefined } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = await getServiceBySlug(slug);
  if (!s) notFound();
  const others = (await getServices()).filter((o) => o.id !== s.id).slice(0, 3);

  return (
    <>
      <section className="bg-sand">
        <div className="container-x grid gap-10 py-12 md:py-20 lg:grid-cols-2 lg:gap-20">
          <div className="img-zoom aspect-[4/5] overflow-hidden rounded-md bg-mist" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <Link href="/services" className="eyebrow text-cobalt hover:underline">← All services</Link>
            <h1 className="display mt-4 text-5xl md:text-7xl">{s.name}</h1>
            <p className="mt-6 text-lg leading-relaxed text-espresso/80">{s.description || s.shortDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-espresso/20 py-5">
              <div>
                <p className="eyebrow text-espresso/60">Starting at</p>
                <p className="display mt-1 text-3xl">{formatNaira(s.priceNgn)}</p>
              </div>
              <div>
                <p className="eyebrow text-espresso/60">Duration</p>
                <p className="mt-1 flex items-center gap-2 text-xl font-semibold"><Clock className="h-5 w-5 text-cobalt" /> {fmtDuration(s.durationMin)}</p>
              </div>
            </div>
            {s.includes.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {s.includes.map((i) => (
                  <li key={i} className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-cobalt" /> {i}</li>
                ))}
              </ul>
            )}
            <Link href={`/book?service=${s.id}`} className="btn btn-primary mt-10 w-full !py-4 sm:w-auto sm:self-start">Book {s.name}</Link>
          </div>
        </div>
      </section>
      {others.length > 0 && (
        <section className="bg-cream py-16">
          <div className="container-x">
            <h2 className="display mb-8 text-3xl">You might also like</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.id} href={`/services/${o.slug}`} className="group flex items-center justify-between border border-espresso/20 p-5 transition hover:border-cobalt hover:bg-white">
                  <span><span className="display block text-lg">{o.name}</span><span className="text-xs text-espresso/70">From {formatNaira(o.priceNgn)} · {fmtDuration(o.durationMin)}</span></span>
                  <span className="text-cobalt transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
