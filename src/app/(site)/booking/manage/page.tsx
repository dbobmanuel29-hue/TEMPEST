import type { Metadata } from "next";
import { ManageLookup } from "@/components/ManageLookup";
import { PageHeader } from "@/components/PageHeader";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Manage booking", robots: { index: false } };

export default async function ManagePage({ searchParams }: { searchParams: Promise<{ ref?: string; payment?: string }> }) {
  const { ref, payment } = await searchParams;
  const user = await getUser();
  return (
    <>
      <PageHeader eyebrow="Appointments" title={<>Manage<br />booking</>} intro="Check your appointment status, cancel, or request a new time using your booking reference." />
      <section className="bg-cream py-14">
        <div className="container-x max-w-3xl">
          <ManageLookup initialRef={ref ?? ""} loggedIn={Boolean(user)} payment={payment} />
        </div>
      </section>
    </>
  );
}
