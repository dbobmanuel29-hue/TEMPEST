import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { getServices } from "@/lib/data";

export const metadata: Metadata = { title: "Services & Prices", description: "Haircuts, skin fades, beard grooming, hot towel shaves, treatments and styling at Tempest Barber Lounge." };

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader eyebrow="Services" title={<>Grooming,<br />done properly.</>} intro="Every service includes a consultation so you leave exactly how you imagined. Prices shown are starting prices." />
      <section className="bg-cream py-16 md:py-24">
        <div className="container-x grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} delay={(i % 4) * 80} />
          ))}
          {!services.length && <p className="col-span-full text-espresso/70">Services are being updated — please check back shortly.</p>}
        </div>
      </section>
    </>
  );
}
