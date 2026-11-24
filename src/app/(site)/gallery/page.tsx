import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/GalleryGrid";
import { IMG } from "@/lib/media";

export const metadata: Metadata = { title: "Gallery", description: "Low, mid, high, burst and taper fades, afros, waves, dreadlocks and beard styles." };

export default function GalleryPage() {
  return (
    <>
      <section className="overflow-hidden bg-sand">
        <div className="container-x grid items-center gap-9 py-14 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-14 lg:py-24">
          <div className="min-w-0">
            <p className="eyebrow text-cobalt" data-reveal>Tempest style gallery</p>
            <h1 className="display mt-5 max-w-[10ch] text-[clamp(3.2rem,7vw,6rem)]" data-reveal style={{ "--d": "80ms" } as React.CSSProperties}>Find your next look.</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-espresso/75" data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>From sharp fades to textured styles and detailed beard work, explore the looks that inspire the next version of you.</p>
            <Link href="/book" className="btn btn-primary mt-8" data-reveal style={{ "--d": "220ms" } as React.CSSProperties}>Book your style</Link>
          </div>
          <div className="relative mx-auto w-full max-w-[38rem] lg:max-w-none" data-reveal>
            <div className="absolute -right-3 top-8 h-[88%] w-[78%] bg-cobalt" aria-hidden />
            <div className="img-zoom relative aspect-[5/4] overflow-hidden rounded-md bg-mist sm:aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.cape} alt="Barber preparing a client for a fresh haircut" fetchPriority="high" className="h-full w-full object-cover object-center" />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-cream py-12 md:py-16">
        <div className="container-x">
          <div className="mb-8 max-w-xl" data-reveal><p className="eyebrow text-cobalt">Explore the details</p><h2 className="display mt-3 text-3xl md:text-5xl">Cuts worth saving.</h2><p className="mt-4 leading-relaxed text-espresso/70">Browse fades, textures and beard work. Tap any image to view it full screen, then use the arrows to move through the collection.</p></div>
          <GalleryGrid />
          <div className="mt-16 flex flex-col items-center gap-4 border-t border-espresso/15 pt-12 text-center">
            <p className="display text-3xl">Found your look?</p>
            <Link href="/book" className="btn btn-primary">Book Appointment</Link>
          </div>
        </div>
      </section>
    </>
  );
}
