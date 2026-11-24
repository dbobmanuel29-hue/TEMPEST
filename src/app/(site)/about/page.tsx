import { Crown, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { IMG } from "@/lib/media";

export const metadata: Metadata = { title: "About", description: "More than a barbershop. It's a lifestyle. Discover Tempest Barber Lounge." };

const POINTS = [
  { icon: Sparkles, title: "The environment", text: "A modern lounge with natural light, leather chairs and a calm, confident energy." },
  { icon: UserCheck, title: "Professional barbers", text: "A team that listens first, then cuts with precision." },
  { icon: ShieldCheck, title: "Clean equipment", text: "Tools sanitised between every client, fresh towels and capes each visit." },
  { icon: Crown, title: "Customer experience", text: "Online booking, honest timing and a service that respects your day." },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-sand">
        <div className="container-x grid items-end gap-10 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-cobalt" data-reveal>About Tempest Barber Lounge</p>
            <h1 className="display mt-4 text-[clamp(2.8rem,8vw,6.5rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>The art of grooming.</h1>
            <p className="mt-6 text-2xl text-cobalt" data-reveal style={{ "--d": "140ms" } as React.CSSProperties}>More than a barbershop. It&apos;s a lifestyle.</p>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-espresso/80" data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
            Tempest is built around a simple idea: a great haircut changes how you carry yourself. We combine sharp technique, a premium setting and
            attention to detail so you walk out feeling like the best version of you.
          </p>
        </div>
      </section>

      <section className="bg-sand pb-20">
        <div className="container-x grid gap-4 md:grid-cols-12">
          <div className="img-zoom aspect-[16/10] overflow-hidden rounded-md md:col-span-8" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.interiorWide} alt="Spacious modern barbershop interior" className="h-full w-full object-cover" />
          </div>
          <div className="img-zoom aspect-[4/5] overflow-hidden rounded-md md:col-span-4 md:aspect-auto" data-reveal style={{ "--d": "100ms" } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.cutting} alt="Barber carefully cutting a client's hair" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-espresso text-cream">
        <div className="container-x py-20 md:py-28">
          <h2 className="display text-4xl md:text-6xl" data-reveal>What you can expect</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map((p, i) => (
              <div key={p.title} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties} className="border-t border-cream/25 pt-6">
                <p.icon className="h-7 w-7 text-sand" strokeWidth={1.5} />
                <h3 className="display mt-6 text-xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="container-x grid items-center gap-8 md:grid-cols-2">
          <div className="img-zoom aspect-[4/3] overflow-hidden rounded-md" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.detail} alt="Close-up of clippers during a precision haircut" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div data-reveal>
            <h2 className="display text-4xl md:text-5xl">Attention to detail.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-espresso/80">From the first consultation to the final line-up, every step is deliberate. We take the time to get the small things right because they&apos;re what you notice in the mirror.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/barbers" className="btn btn-outline">Meet our barbers</Link>
              <Link href="/book" className="btn btn-primary">Book Appointment</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
