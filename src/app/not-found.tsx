import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-sand px-6 text-center">
      <LogoMark className="h-16 w-16" />
      <p className="eyebrow mt-8 text-cobalt">Error 404</p>
      <h1 className="display mt-3 text-[clamp(3rem,10vw,7rem)]">Off the map.</h1>
      <p className="mt-4 max-w-sm text-espresso/75">That page doesn&apos;t exist — it may have been moved or never existed in the first place.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-dark">Back home</Link>
        <Link href="/book" className="btn btn-primary">Book Appointment</Link>
      </div>
    </section>
  );
}
