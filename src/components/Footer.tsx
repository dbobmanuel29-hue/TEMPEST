import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/icons";
import { Logo } from "@/components/Logo";
import { hoursList } from "@/lib/hours";
import { whatsappLink } from "@/lib/settings";
import type { BusinessSettings, ContactSettings } from "@/lib/types";

export function Footer({
  contact,
  business,
  services,
}: {
  contact: ContactSettings;
  business: BusinessSettings;
  services: { name: string; slug: string }[];
}) {
  const social = [
    { label: "Instagram", href: contact.instagram, icon: <InstagramIcon /> },
    { label: "TikTok", href: contact.tiktok, icon: <TikTokIcon /> },
    { label: "WhatsApp", href: whatsappLink(contact.whatsapp, "Hello Tempest! I'd like to ask about an appointment."), icon: <WhatsAppIcon /> },
  ];
  return (
    <footer className="bg-espresso text-cream">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo tone="dark" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/70">Premium grooming. Modern styles. Unmatched confidence.</p>
          <p className="display mt-6 text-xl text-sand">Look sharp.<br />Feel powerful.</p>
          <div className="mt-6 flex gap-3">
            {social.map((s) => {
              const live = Boolean(s.href);
              return live ? (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center border border-cream/30 transition hover:border-cobalt hover:bg-cobalt">
                  {s.icon}
                </a>
              ) : (
                <span key={s.label} aria-label={`${s.label} (link coming soon)`} title={`${s.label} link not set yet`} className="flex h-10 w-10 cursor-not-allowed items-center justify-center border border-cream/15 text-cream/40">
                  {s.icon}
                </span>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="eyebrow mb-5 text-sand">Explore</h3>
          <ul className="space-y-3 text-sm text-cream/80">
            {[["Home", "/"], ["Services", "/services"], ["Gallery", "/gallery"], ["About", "/about"], ["Our Barbers", "/barbers"], ["Reviews", "/reviews"], ["Contact", "/contact"], ["Book Appointment", "/book"]].map(([l, h]) => (
              <li key={h}><Link href={h} className="transition hover:text-white hover:underline">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="eyebrow mb-5 text-sand">Services</h3>
          <ul className="space-y-3 text-sm text-cream/80">
            {services.map((s) => (
              <li key={s.slug}><Link href={`/services/${s.slug}`} className="transition hover:text-white hover:underline">{s.name}</Link></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h3 className="eyebrow mb-5 text-sand">Visit & Hours</h3>
          <ul className="space-y-3 text-sm text-cream/80">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sand" />{contact.address}</li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-sand" /><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:underline">{contact.phone}</a></li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-sand" /><a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a></li>
          </ul>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            {hoursList(business).map((h) => (
              <div key={h.day} className="contents">
                <dt className="text-cream/60">{h.day.slice(0, 3)}</dt>
                <dd className={h.text === "Closed" ? "text-cream/50" : ""}>{h.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-6 text-xs text-cream/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tempest Barber Lounge. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 uppercase tracking-[0.14em]">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link href="/cancellation-policy" className="hover:text-white">Cancellation Policy</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
