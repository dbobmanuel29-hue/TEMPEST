"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

export function ContactForm() {
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/contact", "POST", f);
      toast("Message sent. We'll get back to you soon.");
      setF({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="c-name" className="label">Name</label><input id="c-name" required className="field" value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div><label htmlFor="c-phone" className="label">Phone (optional)</label><input id="c-phone" type="tel" className="field" value={f.phone} onChange={set("phone")} autoComplete="tel" /></div>
      </div>
      <div><label htmlFor="c-email" className="label">Email</label><input id="c-email" type="email" required className="field" value={f.email} onChange={set("email")} autoComplete="email" /></div>
      <div><label htmlFor="c-msg" className="label">Message</label><textarea id="c-msg" required rows={5} className="field" value={f.message} onChange={set("message")} /></div>
      <button disabled={busy} className="btn btn-dark w-full sm:w-auto">{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
