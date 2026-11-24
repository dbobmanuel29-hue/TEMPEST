import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Gallery", description: "Low, mid, high, burst and taper fades, afros, waves, dreadlocks and beard styles." };

export default function GalleryPage() {
  return (
    <>
      <PageHeader eyebrow="Gallery" title={<>Popular<br />styles</>} intro="Browse fades, textures and beard work. Tap any image to view it full screen." />
      <section className="bg-cream py-12 md:py-16">
        <div className="container-x">
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
