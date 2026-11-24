import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import { getServices } from "@/lib/data";
import { IMG } from "@/lib/media";

export const metadata: Metadata = { title: "Services & Prices", description: "Haircuts, skin fades, beard grooming, hot towel shaves, treatments and styling at Tempest Barber Lounge." };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <section className="overflow-hidden bg-sand">
        <div className="container-x grid items-center gap-9 py-14 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:py-24">
          <div className="min-w-0">
            <p className="eyebrow text-cobalt" data-reveal>Tempest grooming menu</p>
            <h1 className="display mt-5 max-w-[11ch] text-[clamp(3.1rem,6.5vw,5.7rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>Grooming, done properly.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-espresso/75" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>Precision cuts, clean fades and considered grooming. Every appointment starts with a consultation so the finish feels like you.</p>
            <Link href="/book" className="btn btn-primary mt-8" data-reveal style={{ "--d": "220ms" } as React.CSSProperties}>Choose your service</Link>
          </div>
          <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none" data-reveal>
            <div className="absolute -right-3 top-8 h-[88%] w-[78%] bg-cobalt" aria-hidden />
            <div className="img-zoom relative aspect-[5/4] overflow-hidden rounded-md bg-mist sm:aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.clipper} alt="Barber using professional clippers for a precision fade" fetchPriority="high" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-cream py-16 md:py-24">
        <div className="container-x">
          <div className="mb-10 max-w-xl" data-reveal><p className="eyebrow text-cobalt">The service menu</p><h2 className="display mt-3 text-3xl md:text-5xl">Find the right finish.</h2><p className="mt-4 leading-relaxed text-espresso/70">Explore the options, compare starting prices and choose the service that matches the look you have in mind.</p></div>
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => <ServiceCard key={s.id} s={s} delay={(i % 4) * 80} />)}
            {!services.length && <p className="col-span-full text-espresso/70">Services are being updated — please check back shortly.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
