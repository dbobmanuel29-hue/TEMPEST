"use client";

import { Menu, Search, User, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

const PAGES = [
  { label: "Our Barbers", href: "/barbers" },
  { label: "Book an appointment", href: "/book" },
  { label: "Manage my booking", href: "/booking/manage" },
  { label: "Cancellation policy", href: "/cancellation-policy" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Tempest", href: "/about" },
  { label: "Contact & location", href: "/contact" },
];

export function Header({
  user,
  services,
}: {
  user: { name: string; role: string } | null;
  services: { name: string; slug: string }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearching(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open || searching ? "hidden" : "";
    if (searching) setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearching(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, searching]);

  const results = q.trim()
    ? [
        ...services.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).map((s) => ({ label: s.name, href: `/services/${s.slug}`, kind: "Service" })),
        ...PAGES.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())).map((p) => ({ ...p, kind: "Page" })),
      ]
    : [];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const accountHref = user ? (user.role === "admin" ? "/admin" : "/account") : "/login";

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "border-espresso/10 bg-sand/95 shadow-sm backdrop-blur" : "border-transparent bg-sand"
        }`}
      >
        <div className={`container-x flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? "h-14" : "h-[4.5rem]"}`}>
          <Link href="/" aria-label="Tempest Barber Lounge — home" className="shrink-0">
            <Logo tone="light" />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(n.href) ? "page" : undefined}
                className="group relative py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em]"
              >
                {n.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-[2px] origin-left bg-cobalt transition-transform duration-300 ${
                    isActive(n.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button aria-label="Search" onClick={() => setSearching(true)} className="rounded p-2 transition hover:bg-espresso/10">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href={accountHref} aria-label={user ? `Account (${user.name})` : "Sign in"} className="rounded p-2 transition hover:bg-espresso/10">
              {user ? (
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-espresso text-[0.65rem] font-bold text-cream">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-[18px] w-[18px]" />
              )}
            </Link>
            <Link href="/book" className="btn btn-primary btn-sm ml-1 !px-3 sm:!px-5 sm:!py-3">
              <span className="sm:hidden">Book</span>
              <span className="hidden sm:inline">Book Appointment</span>
            </Link>
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="rounded p-2 transition hover:bg-espresso/10 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          style={{ top: scrolled ? "3.5rem" : "4.5rem" }}
          className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-espresso text-cream transition-all duration-300 lg:hidden ${
            open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
          }`}
        >
          <nav aria-label="Mobile" className="container-x flex flex-col py-6">
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                className={`display flex items-center justify-between border-b border-cream/15 py-4 text-3xl transition-all duration-300 ${
                  open ? "translate-x-0 opacity-100" : "-translate-x-3 opacity-0"
                } ${isActive(n.href) ? "text-sand" : ""}`}
              >
                {n.label}
                <ArrowRight className="h-5 w-5 opacity-60" />
              </Link>
            ))}
            <Link href="/barbers" className="py-4 text-sm uppercase tracking-[0.18em] text-cream/80">Our Barbers</Link>
            <Link href={accountHref} className="py-2 text-sm uppercase tracking-[0.18em] text-cream/80">
              {user ? (user.role === "admin" ? "Admin dashboard" : "My account") : "Sign in / Register"}
            </Link>
            <Link href="/book" className="btn btn-primary mt-6 w-full !py-4">Book Appointment</Link>
          </nav>
        </div>
      </header>

      {/* Search overlay */}
      {searching && (
        <div className="fixed inset-0 z-[60] bg-espresso/70 backdrop-blur-sm" onClick={() => setSearching(false)} role="dialog" aria-modal="true" aria-label="Search">
          <div className="mx-auto mt-20 w-[92%] max-w-xl bg-cream p-5 shadow-2xl" style={{ animation: "pop 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (results[0]) router.push(results[0].href);
              }}
              className="flex items-center gap-3 border-b-2 border-espresso pb-3"
            >
              <Search className="h-5 w-5" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search services and pages…"
                className="w-full bg-transparent text-lg outline-none placeholder:text-espresso/50"
                aria-label="Search"
              />
              <button type="button" aria-label="Close search" onClick={() => setSearching(false)}>
                <X className="h-5 w-5" />
              </button>
            </form>
            <ul className="mt-3 max-h-72 overflow-y-auto">
              {q && results.length === 0 && <li className="py-3 text-sm text-espresso/70">No matches for “{q}”.</li>}
              {results.map((r) => (
                <li key={r.href + r.label}>
                  <Link href={r.href} className="flex items-center justify-between py-3 hover:text-cobalt">
                    <span className="font-medium">{r.label}</span>
                    <span className="eyebrow text-espresso/60">{r.kind}</span>
                  </Link>
                </li>
              ))}
              {!q && <li className="py-3 text-sm text-espresso/70">Try “fade”, “beard” or “book”.</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
