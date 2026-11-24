import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { hoursList } from "@/lib/hours";
import { getBusiness, getContact, whatsappLink } from "@/lib/settings";

export const metadata: Metadata = { title: "Contact & Location", description: "Find Tempest Barber Lounge, opening hours, phone, WhatsApp and contact form." };

export default async function ContactPage() {
  const [c, b] = await Promise.all([getContact(), getBusiness()]);
  return (
    <>
      <PageHeader eyebrow="Contact" title={<>Visit<br />Tempest</>} intro="Questions about a style, a booking or a special occasion? Get in touch." />
      <section className="bg-cream py-16 md:py-20">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <div className="space-y-8">
            <ul className="space-y-5">
              <li className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-cobalt" /><div><p className="label">Address</p><p>{c.address}</p></div></li>
              <li className="flex gap-4"><Phone className="mt-1 h-5 w-5 shrink-0 text-cobalt" /><div><p className="label">Phone</p><a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-cobalt">{c.phone}</a></div></li>
              <li className="flex gap-4"><Mail className="mt-1 h-5 w-5 shrink-0 text-cobalt" /><div><p className="label">Email</p><a href={`mailto:${c.email}`} className="hover:text-cobalt">{c.email}</a></div></li>
            </ul>
            <a href={whatsappLink(c.whatsapp, "Hello Tempest! I'd like to ask about an appointment.")} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
            <div>
              <p className="label flex items-center gap-2"><Clock className="h-4 w-4 text-cobalt" /> Opening hours</p>
              <dl className="mt-3 max-w-xs divide-y divide-espresso/15 border-y border-espresso/15 text-sm">
                {hoursList(b).map((h) => (
                  <div key={h.day} className="flex justify-between py-2"><dt>{h.day}</dt><dd className={h.text === "Closed" ? "text-espresso/50" : "font-medium"}>{h.text}</dd></div>
                ))}
              </dl>
              <p className="mt-2 text-xs text-espresso/60">Times shown in West Africa Time (Africa/Lagos).</p>
            </div>
          </div>
          <div>
            <h2 className="display text-3xl">Send a message</h2>
            <div className="mt-6"><ContactForm /></div>
          </div>
        </div>
      </section>
      <section className="bg-sand">
        <div className="aspect-[4/3] w-full md:aspect-[21/8]">
          <iframe
            title="Map showing Tempest Barber Lounge location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery)}&output=embed`}
            className="h-full w-full border-0 grayscale-[30%]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
