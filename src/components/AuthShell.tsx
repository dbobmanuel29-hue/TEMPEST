import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IMG } from "@/lib/media";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="grid min-h-[calc(100svh-4.5rem)] bg-sand lg:grid-cols-2">
      <div className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG.cape} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-espresso/55" />
        <div className="absolute inset-x-10 bottom-10 text-cream">
          <p className="display text-5xl">Look sharp.<br />Feel powerful.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-block lg:hidden"><Logo /></Link>
          <h1 className="display text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 text-espresso/75">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
