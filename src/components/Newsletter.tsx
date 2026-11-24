"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

export function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/newsletter", "POST", { email });
      setDone(true);
      setEmail("");
      toast("You're on the list. Thanks for subscribing!");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-cream">
      <div className="container-x grid gap-10 py-20 md:grid-cols-2 md:items-center">
        <div data-reveal>
          <p className="eyebrow text-cobalt">Newsletter</p>
          <h2 className="display mt-3 text-4xl md:text-5xl">Stay sharp.<br />Stay updated.</h2>
          <p className="mt-5 max-w-md text-espresso/75">New services, promotions, special offers and grooming tips — straight to your inbox.</p>
        </div>
        <div data-reveal style={{ "--d": "120ms" } as React.CSSProperties}>
          {done ? (
            <p className="border-l-4 border-cobalt bg-white p-5 text-sm">Thanks — your email has been added to our subscriber list.</p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-0 sm:flex-row" noValidate>
              <label htmlFor="nl-email" className="sr-only">Email address</label>
              <input
                id="nl-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="field !rounded-b-none sm:!rounded-r-none sm:!rounded-bl-[3px] !border-espresso !py-4"
              />
              <button disabled={busy} className="btn btn-dark !rounded-t-none sm:!rounded-l-none sm:!rounded-tr-[3px] !py-4">
                {busy ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-espresso/60">By subscribing you agree to our <a href="/privacy" className="underline">Privacy Policy</a>. Unsubscribe any time.</p>
        </div>
      </div>
    </section>
  );
}
