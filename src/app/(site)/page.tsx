import { ArrowRight, Crown, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";
import { Newsletter } from "@/components/Newsletter";
import { NoReviews, ReviewCard } from "@/components/ReviewCard";
import { ServiceCard } from "@/components/ServiceCard";
import { getApprovedReviews, getServices } from "@/lib/data";
import { GALLERY, IMG, px } from "@/lib/media";

const WHY = [
  { icon: UserCheck, title: "Professional Barbers", text: "Skilled hands, honest consultations and cuts tailored to you." },
  { icon: Sparkles, title: "Modern Atmosphere", text: "A relaxed, stylish lounge designed to make every visit feel premium." },
  { icon: ShieldCheck, title: "Clean & Safe Environment", text: "Sanitised tools and a spotless space, every single appointment." },
  { icon: Crown, title: "Personalized Grooming", text: "Your look, your routine, your schedule — nothing off the shelf." },
];

const PREVIEW = [12304510, 19112533, 39945585, 5853395, 4625632, 9374359, 6487911, 13450758].map((id) => GALLERY.find((g) => g.id === id)!);

export default async function HomePage() {
  const [services, reviews] = await Promise.all([getServices(), getApprovedReviews(6)]);

  return (
    <>
      <section className="overflow-hidden bg-sand">
        <div className="container-x grid items-center gap-9 pb-14 pt-8 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-12 lg:gap-8 lg:py-8">
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-cobalt" data-reveal>
              <span className="h-px w-8 bg-cobalt" /> Look sharp. Feel powerful.
            </p>
            <h1 className="display mt-6 max-w-full" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>
              <span className="block whitespace-nowrap text-[clamp(3.2rem,8vw,7rem)]">Tempest</span>
              <span className="mt-1 block text-[clamp(2.1rem,4.7vw,4rem)] text-cobalt">Barber Lounge</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-espresso/80 sm:text-lg" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
              Premium grooming. Modern styles. Unmatched confidence. Book your appointment today and step into a sharper you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3" data-reveal style={{ "--d": "240ms" } as React.CSSProperties}>
              <Link href="/book" className="btn btn-primary !px-7 !py-4">Book Appointment</Link>
              <Link href="/services" className="btn btn-outline !px-7 !py-4">Explore Services</Link>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full min-w-0 max-w-[34rem] lg:order-2 lg:col-span-5 lg:max-w-none lg:self-stretch lg:py-2">
            <div className="absolute -right-3 top-10 hidden h-[86%] w-[78%] bg-cobalt sm:block" aria-hidden />
            <div className="img-zoom relative ml-auto aspect-[4/5] w-full overflow-hidden bg-mist sm:w-[90%] lg:h-full lg:min-h-[34rem] lg:aspect-auto" data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.hero} alt="Man with a sharp fade and groomed beard, photographed in profile" className="h-full w-full object-cover object-[50%_25%]" fetchPriority="high" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28" id="services">
        <div className="container-x">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div data-reveal>
              <p className="eyebrow text-cobalt">What we do</p>
              <h2 className="display mt-3 text-4xl md:text-6xl">Our services</h2>
              <p className="mt-4 max-w-md text-espresso/75">Precision grooming, from a clean everyday cut to the full hot-towel treatment.</p>
            </div>
            <Link href="/services" className="eyebrow inline-flex items-center gap-2 border-b-2 border-espresso pb-1 transition-colors hover:text-cobalt" data-reveal>All services <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => <ServiceCard key={s.id} s={s} delay={(i % 4) * 80} />)}
            <Link href="/book" data-reveal className="group flex min-h-72 flex-col justify-between rounded-md bg-espresso p-7 text-cream transition-colors duration-300 hover:bg-cobalt">
              <span className="eyebrow text-sand group-hover:text-cream">Ready when you are</span>
              <span><span className="display block text-3xl">Reserve your chair</span><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">Book online <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-sand py-20 md:py-28">
        <div className="container-x">
          <div className="mb-10 text-center" data-reveal>
            <p className="eyebrow text-cobalt">Popular styles</p>
            <h2 className="display mt-3 text-4xl md:text-6xl">Fades. Waves. Fresh lines.</h2>
            <p className="mx-auto mt-4 max-w-md text-espresso/75">A look at the cuts and grooming our clients ask for most.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {PREVIEW.map((g, i) => <Link key={g.id} href="/gallery" data-reveal style={{ "--d": `${(i % 4) * 70}ms` } as React.CSSProperties} className="img-zoom group relative aspect-[3/4] overflow-hidden rounded-md bg-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={px(g.id, 600, 800)} alt={g.alt} loading="lazy" className="h-full w-full object-cover" />
              <span className="absolute bottom-3 left-3 bg-cream px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]">{g.category}</span>
            </Link>)}
          </div>
          <div className="mt-10 text-center"><Link href="/gallery" className="btn btn-outline">View full gallery</Link></div>
        </div>
      </section>

      <section className="bg-espresso text-cream">
        <div className="container-x grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-sand" data-reveal>About Tempest</p>
            <h2 className="display mt-4 text-5xl md:text-7xl" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>The art of grooming.</h2>
            <p className="mt-6 text-2xl text-sand" data-reveal style={{ "--d": "140ms" } as React.CSSProperties}>More than a barbershop. It&apos;s a lifestyle.</p>
            <ul className="mt-8 grid gap-3 text-sm text-cream/80 sm:grid-cols-2" data-reveal style={{ "--d": "200ms" } as React.CSSProperties}>
              {["The barbershop environment", "Professional barbers", "Clean equipment", "Customer experience", "Attention to detail"].map((t) => <li key={t} className="flex items-center gap-3"><span className="h-px w-5 bg-cobalt" />{t}</li>)}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3" data-reveal style={{ "--d": "260ms" } as React.CSSProperties}>
              <Link href="/about" className="btn btn-outline-light">Our story</Link><Link href="/barbers" className="btn btn-primary">Meet the barbers</Link>
            </div>
          </div>
          <div className="relative" data-reveal>
            <div className="img-zoom aspect-[5/4] overflow-hidden"><img src={IMG.interior} alt="Modern barbershop interior with leather chairs and mirrors" loading="lazy" className="h-full w-full object-cover" /></div>
            <div className="absolute -bottom-6 -left-4 hidden w-40 border-8 border-espresso md:block lg:-left-10 lg:w-52"><img src={IMG.clipper} alt="Barber working with clippers" loading="lazy" className="aspect-[4/5] w-full object-cover" /></div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-28">
        <div className="container-x">
          <h2 className="display mb-12 text-4xl md:text-6xl" data-reveal>Why choose Tempest?</h2>
          <div className="grid gap-px overflow-hidden border border-espresso/15 bg-espresso/15 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => <div key={w.title} data-reveal style={{ "--d": `${i * 90}ms` } as React.CSSProperties} className="group bg-cream p-8 transition-colors duration-300 hover:bg-sand">
              <w.icon className="h-8 w-8 text-cobalt transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6" strokeWidth={1.5} />
              <h3 className="display mt-8 text-xl">{w.title}</h3><p className="mt-3 text-sm leading-relaxed text-espresso/75">{w.text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="bg-sand py-20 md:py-28">
        <div className="container-x">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div data-reveal><p className="eyebrow text-cobalt">Reviews</p><h2 className="display mt-3 text-4xl md:text-6xl">Straight from our clients</h2></div>
            <Link href="/reviews" className="eyebrow inline-flex items-center gap-2 border-b-2 border-espresso pb-1 hover:text-cobalt">All reviews <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {reviews.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{reviews.map((r) => <div key={r.id} data-reveal><ReviewCard r={r} /></div>)}</div> : <NoReviews />}
        </div>
      </section>
      <Newsletter />
    </>
  );
}
