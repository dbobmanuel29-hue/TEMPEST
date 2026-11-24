"use client";

import { BarChart3, CalendarCheck, Clock, CreditCard, Inbox, Scissors, Star, Users, UserSquare2, LogOut, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/client";

const LINKS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/barbers", label: "Barbers", icon: UserSquare2 },
  { href: "/admin/hours", label: "Business hours", icon: Clock },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/inbox", label: "Inbox & logs", icon: Inbox },
  { href: "/admin/settings", label: "Payments & settings", icon: CreditCard },
];

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = (h: string) => (h === "/admin" ? pathname === "/admin" : pathname.startsWith(h));
  return (
    <aside className="bg-espresso text-cream lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-6 lg:py-6">
        <Link href="/admin"><Logo tone="dark" /></Link>
        <p className="eyebrow hidden text-sand lg:mt-4 lg:block">Admin · {name.split(" ")[0]}</p>
        <div className="flex gap-1 lg:hidden">
          <Link href="/" aria-label="View site" className="rounded p-2 hover:bg-cream/10"><ExternalLink className="h-4 w-4" /></Link>
          <button aria-label="Sign out" onClick={async () => { await api("/api/auth/logout", "POST"); router.push("/login"); router.refresh(); }} className="rounded p-2 hover:bg-cream/10"><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
      <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-6">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active(l.href) ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${active(l.href) ? "bg-cobalt text-white" : "text-cream/75 hover:bg-cream/10"}`}
          >
            <l.icon className="h-4 w-4" /> {l.label}
          </Link>
        ))}
      </nav>
      <div className="hidden space-y-1 border-t border-cream/15 p-3 lg:block">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream/75 hover:bg-cream/10"><ExternalLink className="h-4 w-4" /> View website</Link>
        <button onClick={async () => { await api("/api/auth/logout", "POST"); router.push("/login"); router.refresh(); }} className="flex w-full items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-cream/75 hover:bg-cream/10"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </aside>
  );
}
