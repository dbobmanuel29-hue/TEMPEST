"use client";

import { ArrowLeft, ArrowRight, Check, Clock, Loader2, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookingCalendar } from "@/components/BookingCalendar";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";
import { workingSummary } from "@/lib/hours";
import { fmtDate, fmtDuration, fmtMin, formatNaira } from "@/lib/time";

type Svc = { id: string; slug: string; name: string; shortDescription: string; priceNgn: number; durationMin: number; imageUrl: string };
type Barber = { id: string; name: string; bio: string; specialties: string[]; photoUrl: string; workingHours: Record<string, { open: boolean; start: string; end: string }> };
type Config = {
  services: Svc[];
  barbers: Barber[];
  business: { maxAdvanceDays: number; cancelHoursBefore: number };
  payments: { methods: { id: string; label: string }[]; mode: "none" | "deposit" | "full"; depositPercent: number; bankDetails: string };
};
type Booking = { id: string; reference: string; serviceName: string; barberName: string; date: string; startMin: number; priceNgn: number; amountDueNgn: number; status: string; customerName: string; customerPhone: string; customerEmail: string; notes: string; paymentMethod: string; durationMin: number };

const STEPS = ["Service", "Barber", "Date", "Time", "Details", "Confirm"];

export function BookingWizard({
  user,
  initialService,
  initialBarber,
}: {
  user: { name: string; email: string; phone: string | null } | null;
  initialService?: string;
  initialBarber?: string;
}) {
  const toast = useToast();
  const [cfg, setCfg] = useState<Config | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(initialBarber ?? null); // "any" | id
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ start: number; label: string }[] | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [form, setForm] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", email: user?.email ?? "", notes: "" });
  const [method, setMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  useEffect(() => {
    api<Config>("/api/booking/config")
      .then((c) => {
        setCfg(c);
        if (initialService && c.services.some((s) => s.id === initialService)) {
          setServiceId(initialService);
          setStep(initialBarber && c.barbers.some((b) => b.id === initialBarber) ? 3 : 2);
        }
        if (initialBarber && !c.barbers.some((b) => b.id === initialBarber)) setBarberId(null);
        setMethod(c.payments.methods[0]?.id ?? "");
      })
      .catch(() => setLoadErr(true));
  }, [initialService, initialBarber]);

  const svc = cfg?.services.find((s) => s.id === serviceId) ?? null;
  const barber = cfg?.barbers.find((b) => b.id === barberId) ?? null;

  useEffect(() => {
    if (!date || !serviceId || !barberId || !svc) return;
    setSlots(null);
    const saved = JSON.parse(localStorage.getItem("tempest_showcase_bookings") || "[]") as Booking[];
    const busySlots = saved.filter((b) => b.date === date && (barberId === "any" || b.barberName === barber?.name));
    const available: { start: number; label: string }[] = [];
    for (let minute = 9 * 60; minute + svc.durationMin <= 18 * 60; minute += 30) {
      const conflict = busySlots.some((b) => minute < b.startMin + b.durationMin && minute + svc.durationMin > b.startMin);
      if (!conflict) available.push({ start: minute, label: fmtMin(minute) });
    }
    setSlots(available);
  }, [date, serviceId, barberId, svc, barber]);

  const due = useMemo(() => {
    if (!cfg || !svc) return 0;
    const p = cfg.payments;
    return p.mode === "full" ? svc.priceNgn : p.mode === "deposit" ? Math.min(svc.priceNgn, Math.ceil((svc.priceNgn * p.depositPercent) / 100)) : 0;
  }, [cfg, svc]);

  const maxStep = !serviceId ? 1 : !barberId ? 2 : !date ? 3 : start === null ? 4 : 6;
  const valid = form.name.trim().length > 1 && /^[+()\d\s-]{7,20}$/.test(form.phone.trim()) && /\S+@\S+\.\S+/.test(form.email);

  async function confirm() {
    if (!svc || !date || start === null || !barberId) return;
    setBusy(true);
    try {
      const saved = JSON.parse(localStorage.getItem("tempest_showcase_bookings") || "[]") as Booking[];
      const chosenBarber = barber?.name ?? cfg?.barbers[0]?.name ?? "Barber";
      const booking: Booking = {
        id: crypto.randomUUID(), reference: "TMP-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
        serviceName: svc.name, barberName: chosenBarber, date, startMin: start, priceNgn: svc.priceNgn,
        amountDueNgn: 0, status: "confirmed", customerName: form.name, customerPhone: form.phone,
        customerEmail: form.email, notes: form.notes, paymentMethod: "pay_at_shop", durationMin: svc.durationMin,
      };
      localStorage.setItem("tempest_showcase_bookings", JSON.stringify([...saved, booking]));
      setDone(booking);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast("Could not save this booking in this browser. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function payOnline() {
    if (!done) return;
    setBusy(true);
    try {
      const r = await api<{ url: string }>("/api/payments/paystack/initialize", "POST", { reference: done.reference, email: done.customerEmail });
      window.location.href = r.url;
    } catch (e) {
      toast((e as Error).message, "error");
      setBusy(false);
    }
  }

  if (loadErr) return <div className="container-x py-24 text-center"><p className="display text-3xl">We couldn&apos;t load booking.</p><button onClick={() => location.reload()} className="btn btn-dark mt-6">Try again</button></div>;
  if (!cfg) return (
    <div className="container-x py-12" aria-busy="true">
      <div className="skeleton h-10 w-full max-w-2xl" />
      <div className="mt-8 grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
    </div>
  );

  /* ---------- SUCCESS ---------- */
  if (done) {
    const bank = done.paymentMethod === "bank_transfer";
    const card = done.paymentMethod === "card";
    return (
      <div className="container-x max-w-3xl py-12 md:py-20" style={{ animation: "pop 0.3s ease" }}>
        <div className="flex h-14 w-14 items-center justify-center bg-cobalt text-white"><Check className="h-7 w-7" /></div>
        <h1 className="display mt-6 text-4xl md:text-6xl">Booking {done.status === "confirmed" ? "confirmed" : "received"}</h1>
        <p className="mt-4 text-espresso/80">
          {done.status === "confirmed" ? "You're all set." : "Your appointment is pending — we'll confirm it shortly."} Keep your reference to check or manage this booking.
        </p>
        <div className="mt-8 border-2 border-espresso bg-cream p-6">
          <p className="eyebrow text-espresso/60">Booking reference</p>
          <p className="display mt-1 text-4xl tracking-wide text-cobalt">{done.reference}</p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <Row k="Service" v={`${done.serviceName} (${fmtDuration(done.durationMin)})`} />
            <Row k="Barber" v={done.barberName} />
            <Row k="Date" v={fmtDate(done.date)} />
            <Row k="Time" v={`${fmtMin(done.startMin)} (Africa/Lagos)`} />
            <Row k="Total" v={formatNaira(done.priceNgn)} />
            <Row k="Status" v={done.status} />
            <Row k="Name" v={done.customerName} />
            <Row k="Phone / Email" v={`${done.customerPhone} · ${done.customerEmail}`} />
            {done.notes && <Row k="Notes" v={done.notes} />}
          </dl>
        </div>
        {bank && (
          <div className="mt-6 border-l-4 border-cobalt bg-white p-5 text-sm">
            <p className="font-semibold">Pay by bank transfer {done.amountDueNgn > 0 && `— ${formatNaira(done.amountDueNgn)} due`}</p>
            <p className="mt-2 whitespace-pre-line text-espresso/80">{cfg.payments.bankDetails || "Bank details will be shared by the shop."}</p>
            <p className="mt-2 text-espresso/70">Use <strong>{done.reference}</strong> as the payment reference. The shop will record your payment once received.</p>
          </div>
        )}
        {card && (
          <div className="mt-6 border-l-4 border-cobalt bg-white p-5 text-sm">
            <p>Complete your online payment of <strong>{formatNaira(done.amountDueNgn || done.priceNgn)}</strong> securely via Paystack. Your booking is only marked paid after Paystack verifies it.</p>
            <button onClick={payOnline} disabled={busy} className="btn btn-primary mt-4">{busy ? "Redirecting…" : "Pay now"}</button>
          </div>
        )}
        {!bank && !card && <p className="mt-6 text-sm text-espresso/70">Payment is due at the barbershop after your service.</p>}
        <p className="mt-6 text-sm text-espresso/70">Cancel online up to {cfg.business.cancelHoursBefore} hours before your appointment. A confirmation email is sent when email delivery is configured.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={user ? "/account" : `/booking/manage?ref=${done.reference}`} className="btn btn-dark">Manage booking</Link>
          <Link href="/" className="btn btn-outline">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-8 md:py-14">
      <h1 className="display text-4xl md:text-6xl">Book appointment</h1>

      {/* Progress */}
      <ol className="mt-8 flex gap-1 overflow-x-auto pb-2 no-scrollbar" aria-label="Booking progress">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const reachable = n <= maxStep || n < step;
          return (
            <li key={s} className="min-w-[4.2rem] flex-1">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => setStep(n)}
                aria-current={step === n ? "step" : undefined}
                className="group w-full text-left disabled:cursor-not-allowed"
              >
                <span className={`block h-1.5 transition-colors duration-500 ${n < step ? "bg-espresso" : n === step ? "bg-cobalt" : "bg-espresso/20"}`} />
                <span className={`mt-2 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] ${n === step ? "text-cobalt" : reachable ? "" : "text-espresso/40"}`}>
                  {n < step ? <Check className="h-3 w-3" /> : <span>{n}</span>} {s}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div key={step} style={{ animation: "pop 0.25s ease" }}>
          {step === 1 && (
            <Section title="Choose a service">
              <div className="grid gap-3 sm:grid-cols-2">
                {cfg.services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setServiceId(s.id); setDate(null); setStart(null); setStep(2); }}
                    className={`flex gap-4 border-2 bg-white p-3 text-left transition hover:border-cobalt ${serviceId === s.id ? "border-cobalt" : "border-transparent"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imageUrl} alt="" className="h-24 w-20 shrink-0 object-cover" />
                    <span className="flex flex-col">
                      <span className="display text-lg">{s.name}</span>
                      <span className="mt-1 line-clamp-2 text-xs text-espresso/70">{s.shortDescription}</span>
                      <span className="mt-auto flex items-center gap-3 pt-2 text-xs font-semibold">
                        <span className="text-cobalt">{formatNaira(s.priceNgn)}</span>
                        <span className="flex items-center gap-1 text-espresso/70"><Clock className="h-3 w-3" />{fmtDuration(s.durationMin)}</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {!cfg.services.length && <p className="text-sm">No services are available to book right now.</p>}
            </Section>
          )}

          {step === 2 && svc && (
            <Section title="Choose your barber">
              <div className="grid gap-3 sm:grid-cols-2">
                <BarberOption selected={barberId === "any"} onClick={() => { setBarberId("any"); setDate(null); setStart(null); setStep(3); }}>
                  <span className="flex h-24 w-20 shrink-0 items-center justify-center bg-espresso text-cream"><UserRound className="h-8 w-8" /></span>
                  <span><span className="display text-lg">Any available barber</span><span className="mt-1 block text-xs text-espresso/70">Maximum choice of times. We&apos;ll assign the best available barber.</span></span>
                </BarberOption>
                {cfg.barbers.map((b) => (
                  <BarberOption key={b.id} selected={barberId === b.id} onClick={() => { setBarberId(b.id); setDate(null); setStart(null); setStep(3); }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {b.photoUrl ? <img src={b.photoUrl} alt="" className="h-24 w-20 shrink-0 object-cover object-top" /> : <span className="h-24 w-20 shrink-0 bg-mist" />}
                    <span className="min-w-0">
                      <span className="display text-lg">{b.name}</span>
                      <span className="mt-1 line-clamp-2 block text-xs text-espresso/70">{b.bio}</span>
                      <span className="mt-1.5 flex flex-wrap gap-1">{b.specialties.map((s) => <span key={s} className="border border-espresso/30 px-1.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wider">{s}</span>)}</span>
                      <span className="mt-1.5 block text-[0.68rem] text-espresso/60">{workingSummary(b.workingHours).split(" · ").slice(0, 2).join(" · ")}…</span>
                    </span>
                  </BarberOption>
                ))}
              </div>
            </Section>
          )}

          {step === 3 && svc && barberId && (
            <Section title="Pick a date">
              <BookingCalendar
                value={date}
                serviceId={svc.id}
                barberId={barberId}
                maxAdvanceDays={cfg.business.maxAdvanceDays}
                onChange={(d) => { setDate(d); setStart(null); setStep(4); }}
              />
            </Section>
          )}

          {step === 4 && date && (
            <Section title={`Pick a time · ${fmtDate(date, true)}`}>
              {slots === null ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
              ) : slots.length === 0 ? (
                <div className="border border-dashed border-espresso/40 p-6 text-sm">
                  No times left on this day for {svc?.name}. <button className="underline" onClick={() => setStep(3)}>Choose another date</button>.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Available times">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      role="radio"
                      aria-checked={start === s.start}
                      onClick={() => { setStart(s.start); setStep(5); }}
                      className={`border-2 py-3 text-sm font-semibold transition ${start === s.start ? "border-cobalt bg-cobalt text-white" : "border-espresso/25 bg-white hover:border-cobalt"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-4 text-xs text-espresso/60">Times shown in Africa/Lagos. Only slots long enough for your service are listed.</p>
            </Section>
          )}

          {step === 5 && (
            <Section title="Your details">
              {!user && (
                <p className="mb-5 border-l-4 border-cobalt bg-white p-3 text-sm">
                  Booking as a guest — no account needed. <Link href="/login?next=/book" className="underline">Sign in</Link> to save your details.
                </p>
              )}
              <form onSubmit={(e) => { e.preventDefault(); if (valid) setStep(6); }} className="space-y-4">
                <div><label htmlFor="b-name" className="label">Full name</label><input id="b-name" required className="field" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label htmlFor="b-phone" className="label">Phone number</label><input id="b-phone" type="tel" inputMode="tel" required className="field" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+234…" /></div>
                  <div><label htmlFor="b-email" className="label">Email address</label><input id="b-email" type="email" required className="field" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div><label htmlFor="b-notes" className="label">Additional instructions (optional)</label><textarea id="b-notes" rows={3} maxLength={500} className="field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Reference style, allergies, anything we should know…" /></div>

                {cfg.payments.methods.length > 0 && (
                  <fieldset className="pt-2">
                    <legend className="label">Payment</legend>
                    {cfg.payments.mode !== "none" && svc && (
                      <p className="mb-2 text-xs text-espresso/70">
                        {cfg.payments.mode === "full" ? "Full payment is required" : `A ${cfg.payments.depositPercent}% deposit is required`}: {formatNaira(due)}.
                      </p>
                    )}
                    <div className="space-y-2">
                      {cfg.payments.methods.map((m) => (
                        <label key={m.id} className={`flex cursor-pointer items-center gap-3 border-2 bg-white p-3 text-sm ${method === m.id ? "border-cobalt" : "border-transparent"}`}>
                          <input type="radio" name="pay" checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-[#315BCE]" />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(4)} className="btn btn-outline"><ArrowLeft className="h-4 w-4" /> Back</button>
                  <button disabled={!valid} className="btn btn-primary flex-1 sm:flex-none">Review booking <ArrowRight className="h-4 w-4" /></button>
                </div>
              </form>
            </Section>
          )}

          {step === 6 && svc && date && start !== null && (
            <Section title="Review & confirm">
              <div className="border-2 border-espresso bg-cream p-5 sm:p-6">
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <Row k="Service" v={`${svc.name} (${fmtDuration(svc.durationMin)})`} />
                  <Row k="Barber" v={barber?.name ?? "Any available barber"} />
                  <Row k="Date" v={fmtDate(date)} />
                  <Row k="Time" v={`${fmtMin(start)} – ${fmtMin(start + svc.durationMin)}`} />
                  <Row k="Name" v={form.name} />
                  <Row k="Phone" v={form.phone} />
                  <Row k="Email" v={form.email} />
                  <Row k="Payment" v={cfg.payments.methods.find((m) => m.id === method)?.label ?? "Pay at the barbershop"} />
                  {form.notes && <Row k="Notes" v={form.notes} />}
                </dl>
                <div className="mt-6 flex items-end justify-between border-t border-espresso/20 pt-4">
                  <span className="eyebrow">Total</span>
                  <span className="display text-3xl text-cobalt">{formatNaira(svc.priceNgn)}</span>
                </div>
                {due > 0 && <p className="mt-1 text-right text-xs text-espresso/70">Due now: {formatNaira(due)}</p>}
              </div>
              <p className="mt-4 text-xs text-espresso/70">By confirming you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/cancellation-policy" className="underline">Cancellation Policy</Link>.</p>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setStep(5)} className="btn btn-outline"><ArrowLeft className="h-4 w-4" /> Back</button>
                <button onClick={confirm} disabled={busy} className="btn btn-primary flex-1 !py-4 sm:flex-none">
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</> : "Confirm appointment"}
                </button>
              </div>
            </Section>
          )}

          {step > 1 && step < 5 && (
            <button onClick={() => setStep(step - 1)} className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] hover:text-cobalt">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit border border-espresso/20 bg-cream p-5 lg:sticky lg:top-24" aria-label="Booking summary">
          <p className="eyebrow text-cobalt">Your booking</p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row k="Service" v={svc?.name ?? "—"} />
            <Row k="Barber" v={barberId === "any" ? "Any available" : (barber?.name ?? "—")} />
            <Row k="Date" v={date ? fmtDate(date, true) : "—"} />
            <Row k="Time" v={start !== null ? fmtMin(start) : "—"} />
          </dl>
          <div className="mt-5 flex items-end justify-between border-t border-espresso/20 pt-4">
            <span className="eyebrow">Total</span>
            <span className="display text-2xl">{svc ? formatNaira(svc.priceNgn) : "—"}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display mb-5 text-2xl md:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="eyebrow text-espresso/55">{k}</dt>
      <dd className="mt-0.5 break-words font-medium first-letter:uppercase">{v}</dd>
    </div>
  );
}

function BarberOption({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex gap-4 border-2 bg-white p-3 text-left transition hover:border-cobalt ${selected ? "border-cobalt" : "border-transparent"}`}>
      {children}
    </button>
  );
}
