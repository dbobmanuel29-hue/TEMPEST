import { Crown, ShieldCheck, Sparkles, UserCheck, Scissors, Clock3, HeartHandshake, Target } from "lucide-react";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { IMG } from "@/lib/media";

export const metadata: Metadata = {
  title: "About",
  description: "Discover the thinking, standards and customer experience behind Tempest Barber Lounge.",
};

const POINTS = [
  { icon: Sparkles, title: "A considered environment", text: "A modern, welcoming lounge where the atmosphere feels as intentional as the haircut. A place to take a breath, reset and leave feeling refreshed." },
  { icon: UserCheck, title: "A personal approach", text: "Good grooming starts with listening. Your preferred style, hair type and everyday routine should all help shape the service you receive." },
  { icon: ShieldCheck, title: "Cleanliness matters", text: "Professional grooming should never compromise on hygiene. Clean tools, fresh towels and a tidy workstation are essential parts of the experience." },
  { icon: Crown, title: "The complete experience", text: "From exploring services to planning an appointment, the aim is to make each step clear, convenient and respectful of your time." },
];

const VALUES = [
  { icon: Scissors, title: "Craftsmanship", text: "Careful technique, balanced finishes and attention to the details that make a style feel complete." },
  { icon: HeartHandshake, title: "Respect", text: "Every client deserves to be welcomed, heard and treated with patience and professionalism." },
  { icon: Clock3, title: "Convenience", text: "Clear service information and a straightforward booking journey help take the uncertainty out of planning a visit." },
  { icon: Target, title: "Consistency", text: "A dependable standard of care should be present from the first conversation to the final check in the mirror." },
];

export default function AboutPage() {
  return (
    <>
      <section className="overflow-hidden bg-sand">
        <div className="container-x grid items-center gap-9 py-12 md:gap-12 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
          <div className="min-w-0">
            <p className="eyebrow text-cobalt" data-reveal>About Tempest Barber Lounge</p>
            <h1 className="display mt-5 max-w-[10ch] text-[clamp(3rem,6.1vw,5.4rem)]" data-reveal style={{ "--d": "80ms" } as CSSProperties}>
              <span className="block">The art of</span><span className="block">grooming.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-cobalt sm:text-2xl" data-reveal style={{ "--d": "140ms" } as CSSProperties}>More than a barbershop. It&apos;s a lifestyle.</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-espresso/80 sm:text-lg" data-reveal style={{ "--d": "200ms" } as CSSProperties}>
              Tempest is built around a simple idea: a great haircut can change how you carry yourself. We bring together thoughtful service, sharp technique and a considered setting to make grooming feel less like a chore and more like time well spent.
            </p>
            <div className="mt-7 flex flex-wrap gap-3" data-reveal style={{ "--d": "250ms" } as CSSProperties}>
              <Link href="/services" className="btn btn-outline">Explore services</Link>
              <Link href="/book" className="btn btn-primary">Book an appointment</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[30rem] lg:max-w-none" data-reveal>
            <div className="absolute -right-2 top-5 h-[88%] w-[78%] bg-cobalt sm:-right-3 sm:top-7" aria-hidden />
            <div className="img-zoom relative aspect-[16/10] overflow-hidden bg-mist sm:aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.interiorWide} alt="Spacious modern barbershop interior" fetchPriority="high" className="h-full w-full object-cover" />
            </div>
            <div className="absolute -bottom-3 -left-3 hidden w-24 border-8 border-sand sm:block md:w-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.cutting} alt="Barber carefully cutting a client's hair" className="aspect-[4/5] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-14 md:py-20">
        <div className="container-x grid items-start gap-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div data-reveal>
            <p className="eyebrow text-cobalt">The thinking behind the brand</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl md:text-5xl">Why Tempest exists.</h2>
          </div>
          <div className="max-w-3xl space-y-5 text-base leading-relaxed text-espresso/80 sm:text-lg" data-reveal style={{ "--d": "100ms" } as CSSProperties}>
            <p>
              Choosing a barber should feel straightforward. Yet customers can be left guessing about what a service includes, how long it may take, which style suits them or how to secure a convenient appointment. Tempest is shaped around making those decisions easier.
            </p>
            <p>
              The idea is to bring the essential parts of a good grooming experience together: useful service information, a welcoming atmosphere, skilled hands and a clear way to plan a visit. Instead of treating a haircut as a quick transaction, we see it as a personal service built on communication and trust.
            </p>
            <p>
              Tempest is a brand concept founded on that customer-first philosophy. Its story is still being written, but the standard it aims for is clear: make every interaction feel considered, and make every visit worth looking forward to.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sand py-12 md:py-16">
        <div className="container-x grid gap-3 md:grid-cols-12 md:gap-4">
          <div className="img-zoom mx-auto aspect-[16/9] w-full max-w-[28rem] overflow-hidden rounded-md md:col-span-8 md:mx-0 md:max-w-none md:aspect-[16/9]" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.interior} alt="Modern barbershop interior with comfortable seating" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="img-zoom mx-auto aspect-[16/9] w-full max-w-[28rem] overflow-hidden rounded-md md:col-span-4 md:mx-0 md:max-w-none md:aspect-auto" data-reveal style={{ "--d": "100ms" } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.detail} alt="Professional barber tools arranged for a grooming service" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="container-x mt-10 grid gap-6 md:grid-cols-3 md:gap-10">
          <div data-reveal><p className="eyebrow text-cobalt">Our mission</p><h3 className="display mt-3 text-2xl">Make grooming feel effortless.</h3><p className="mt-3 text-sm leading-relaxed text-espresso/75">To make quality grooming easier to understand, access and enjoy through thoughtful service and a customer-focused experience.</p></div>
          <div data-reveal style={{ "--d": "80ms" } as CSSProperties}><p className="eyebrow text-cobalt">Our vision</p><h3 className="display mt-3 text-2xl">Raise the everyday standard.</h3><p className="mt-3 text-sm leading-relaxed text-espresso/75">To build a barbershop experience people can rely on for personal style, professional care and a sense of confidence.</p></div>
          <div data-reveal style={{ "--d": "160ms" } as CSSProperties}><p className="eyebrow text-cobalt">Our promise</p><h3 className="display mt-3 text-2xl">Leave feeling sharper.</h3><p className="mt-3 text-sm leading-relaxed text-espresso/75">To approach every appointment with care, clear communication and respect for the person in the chair.</p></div>
        </div>
      </section>

      <section className="bg-espresso text-cream">
        <div className="container-x py-16 md:py-24">
          <p className="eyebrow text-sand" data-reveal>What defines the experience</p>
          <h2 className="display mt-4 max-w-2xl text-3xl sm:text-4xl md:text-6xl" data-reveal>Good grooming is in the details.</h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-cream/70" data-reveal>We believe the best results come from combining technical skill with a service experience that feels organised, comfortable and personal.</p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map((p, i) => <div key={p.title} data-reveal style={{ "--d": `${i * 90}ms` } as CSSProperties} className="border-t border-cream/25 pt-5">
              <p.icon className="h-7 w-7 text-sand" strokeWidth={1.5} />
              <h3 className="display mt-5 text-xl">{p.title}</h3><p className="mt-3 text-sm leading-relaxed text-cream/70">{p.text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-x">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow text-cobalt">The standards we stand for</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl md:text-5xl">A little more care. Every time.</h2>
            <p className="mt-5 leading-relaxed text-espresso/75">These values guide the way Tempest approaches its services, its customers and the details that shape a memorable visit.</p>
          </div>
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => <div key={v.title} className="border-t border-espresso/20 pt-5" data-reveal style={{ "--d": `${i * 80}ms` } as CSSProperties}>
              <v.icon className="h-6 w-6 text-cobalt" strokeWidth={1.6} />
              <h3 className="display mt-5 text-xl">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-espresso/70">{v.text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="bg-sand py-14 md:py-20">
        <div className="container-x grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="img-zoom mx-auto aspect-[16/10] w-full max-w-[26rem] overflow-hidden rounded-md md:mx-0 md:max-w-none md:aspect-[4/3]" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.cutting} alt="Barber focused on a precision haircut" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div data-reveal>
            <p className="eyebrow text-cobalt">Your visit, made simple</p>
            <h2 className="display mt-4 text-3xl sm:text-4xl md:text-5xl">From first look to fresh finish.</h2>
            <div className="mt-7 space-y-5">
              <div><h3 className="font-semibold">01. Explore your options</h3><p className="mt-1 text-sm leading-relaxed text-espresso/75">Review the available services and get a clearer idea of what fits your needs.</p></div>
              <div><h3 className="font-semibold">02. Plan your appointment</h3><p className="mt-1 text-sm leading-relaxed text-espresso/75">Choose a service and preferred time through a simple booking journey.</p></div>
              <div><h3 className="font-semibold">03. Enjoy the experience</h3><p className="mt-1 text-sm leading-relaxed text-espresso/75">Arrive ready to relax, communicate the look you want and leave feeling refreshed.</p></div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/services" className="btn btn-outline">View services</Link><Link href="/book" className="btn btn-primary">Book appointment</Link></div>
          </div>
        </div>
      </section>

      <section className="bg-cobalt text-white">
        <div className="container-x flex flex-col items-start justify-between gap-7 py-12 md:flex-row md:items-center md:py-16">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow text-white/75">TEMPEST BARBER LOUNGE</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl md:text-5xl">Ready for a sharper experience?</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">Explore the services, find the right fit and take the next step towards your fresh look.</p>
          </div>
          <Link href="/book" className="btn border-white bg-white text-cobalt hover:bg-sand hover:text-espresso" data-reveal>Book your visit</Link>
        </div>
      </section>
    </>
  );
}
