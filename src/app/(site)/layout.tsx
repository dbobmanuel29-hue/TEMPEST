import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageDepth } from "@/components/PageDepth";
import { RevealObserver } from "@/components/Reveal";
import { getUser } from "@/lib/auth";
import { getServices } from "@/lib/data";
import { getBusiness, getContact } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [user, services, contact, business] = await Promise.all([getUser(), getServices(), getContact(), getBusiness()]);
  const list = services.map((s) => ({ name: s.name, slug: s.slug }));
  return (
    <>
      <Header user={user ? { name: user.name, role: user.role } : null} services={list} />
      <main id="main">{children}</main>
      <PageDepth />
      <Footer contact={contact} business={business} services={list} />
      <RevealObserver />
    </>
  );
}
