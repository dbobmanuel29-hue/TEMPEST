import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getBarbers } from "@/lib/data";
import { workingSummary } from "@/lib/hours";

export const metadata: Metadata = { title: "Our Barbers", description: "Meet the barbers at Tempest Barber Lounge and book your preferred barber." };

export default async function BarbersPage() {
  const barbers = await getBarbers();
  return (
    <>
      <PageHeader eyebrow="The team" title={<>Our<br />barbers</>} intro="Choose a barber who matches your style — or let us assign whoever is free." />
      <section className="bg-cream py-16 md:py-24">
        <div className="container-x grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((b, i) => (
            <article key={b.id} data-reveal style={{ "--d": `${(i % 3) * 90}ms` } as React.CSSProperties}>
              <div className="img-zoom aspect-[4/5] overflow-hidden rounded-md bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {b.photoUrl ? <img src={b.photoUrl} alt={b.name} loading="lazy" className="h-full w-full object-cover object-top" /> : <div className="flex h-full items-center justify-center display text-6xl text-espresso/30">{b.name[0]}</div>}
              </div>
              <h2 className="display mt-5 text-2xl">{b.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-espresso/75">{b.bio}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {b.specialties.map((s) => (
                  <li key={s} className="border border-espresso/30 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]">{s}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-espresso/65">{workingSummary(b.workingHours)}</p>
              <Link href={`/book?barber=${b.id}`} className="btn btn-primary btn-sm mt-5">Book with {b.name.split(" ")[0]}</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
