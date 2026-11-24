"use client";

import { useState } from "react";
import { BookingCard, type BookingView, type Policy } from "@/components/BookingCard";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

export function ManageLookup({ initialRef, loggedIn, payment }: { initialRef: string; loggedIn: boolean; payment?: string }) {
  const toast = useToast();
  const [ref, setRef] = useState(initialRef);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<null | { booking: BookingView; policy: Policy; cancelHoursBefore: number; email: string }>(null);

  async function find(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ booking: BookingView; policy: Policy; cancelHoursBefore: number }>("/api/bookings/lookup", "POST", { reference: ref, email });
      setRes({ ...r, email });
    } catch (err) {
      setRes(null);
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {payment === "success" && <p className="mb-6 border-l-4 border-cobalt bg-white p-4 text-sm">Payment received and verified. Thank you! Look up your booking below to see its status.</p>}
      {payment === "failed" && <p role="alert" className="mb-6 border-l-4 border-espresso bg-white p-4 text-sm">We couldn&apos;t verify your payment. If you were charged, please contact the shop with your booking reference.</p>}
      <form onSubmit={find} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div><label htmlFor="m-ref" className="label">Booking reference</label><input id="m-ref" required className="field uppercase" placeholder="TMP-XXXXXXXX" value={ref} onChange={(e) => setRef(e.target.value)} /></div>
        <div><label htmlFor="m-email" className="label">Email used to book{loggedIn ? " (optional)" : ""}</label><input id="m-email" type="email" required={!loggedIn} className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button disabled={busy} className="btn btn-dark !py-3.5">{busy ? "Searching…" : "Find booking"}</button>
      </form>
      {res && (
        <div className="mt-8" style={{ animation: "pop 0.25s ease" }}>
          <BookingCard key={res.booking.id} booking={res.booking} policy={res.policy} email={res.email} cancelHours={res.cancelHoursBefore} />
        </div>
      )}
    </div>
  );
}
