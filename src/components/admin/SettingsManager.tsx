"use client";

import { Check, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { PageTitle, Toggle } from "@/components/admin/AdminUI";
import { api } from "@/lib/client";
import type { ContactSettings, PaymentSettings } from "@/lib/types";

export function SettingsManager({ payments, contact, integrations }: { payments: PaymentSettings; contact: ContactSettings; integrations: { label: string; ok: boolean; hint: string }[] }) {
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState(payments);
  const [c, setC] = useState(contact);
  const [busy, setBusy] = useState("");

  async function save(key: "payments" | "contact", value: unknown) {
    setBusy(key);
    try {
      await api("/api/admin/settings", "PUT", { key, value });
      toast("Saved.");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy("");
    }
  }
  const t = (k: keyof ContactSettings, label: string, ph = "") => (
    <div><label className="label" htmlFor={`c-${k}`}>{label}</label><input id={`c-${k}`} className="field" placeholder={ph} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} /></div>
  );

  return (
    <>
      <PageTitle title="Payments & settings" sub="Payment options, deposits and the contact details shown across the website." />
      <div className="grid gap-10 xl:grid-cols-2">
        <section className="space-y-5">
          <h2 className="display text-xl">Payments</h2>
          <Toggle checked={p.payAtShop} onChange={(v) => setP({ ...p, payAtShop: v })} label="Pay at the barbershop" />
          <div className="space-y-2">
            <Toggle checked={p.bankTransfer.enabled} onChange={(v) => setP({ ...p, bankTransfer: { ...p.bankTransfer, enabled: v } })} label="Bank transfer" />
            {p.bankTransfer.enabled && <textarea aria-label="Bank transfer details" rows={3} className="field" placeholder={"Bank name\nAccount name\nAccount number"} value={p.bankTransfer.details} onChange={(e) => setP({ ...p, bankTransfer: { ...p.bankTransfer, details: e.target.value } })} />}
          </div>
          <div>
            <Toggle checked={p.card.enabled} onChange={(v) => setP({ ...p, card: { enabled: v } })} label="Online card payment (Paystack)" />
            {p.card.enabled && !integrations.find((i) => i.label === "Paystack")?.ok && <p className="mt-2 text-xs text-espresso/70">Paystack isn&apos;t configured yet (see status), so this option stays hidden from customers until PAYSTACK_SECRET_KEY is set.</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="pm">Payment required at booking</label><select id="pm" className="field" value={p.mode} onChange={(e) => setP({ ...p, mode: e.target.value as PaymentSettings["mode"] })}><option value="none">None — pay later</option><option value="deposit">Deposit</option><option value="full">Full payment</option></select></div>
            {p.mode === "deposit" && <div><label className="label" htmlFor="pd">Deposit (% of price)</label><input id="pd" type="number" min={1} max={100} className="field" value={p.depositPercent} onChange={(e) => setP({ ...p, depositPercent: Number(e.target.value) })} /></div>}
          </div>
          {p.mode !== "none" && <p className="text-xs text-espresso/70">When a deposit or full payment is required, “pay at the barbershop” is hidden. Enable bank transfer and/or card so customers have a way to pay.</p>}
          <button disabled={busy === "payments"} onClick={() => save("payments", p)} className="btn btn-primary">Save payment settings</button>

          <div className="border-t border-espresso/20 pt-6">
            <h2 className="display mb-3 text-xl">Integration status</h2>
            <ul className="space-y-2 text-sm">
              {integrations.map((i) => (
                <li key={i.label} className="flex items-start gap-3 border border-espresso/20 bg-white p-3">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center ${i.ok ? "bg-cobalt text-white" : "bg-espresso/15"}`}>{i.ok ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}</span>
                  <span><strong>{i.label}</strong> — {i.ok ? "configured" : "not configured"}<br /><span className="text-xs text-espresso/60">{i.hint}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="display text-xl">Contact details & socials</h2>
          {t("address", "Business address")}
          <div className="grid gap-4 sm:grid-cols-2">{t("phone", "Phone")}{t("email", "Public email")}</div>
          {t("whatsapp", "WhatsApp number (international, digits only)", "2348012345678")}
          {t("instagram", "Instagram URL", "https://instagram.com/…")}
          {t("tiktok", "TikTok URL", "https://tiktok.com/@…")}
          {t("mapQuery", "Google Maps search (address or place name)")}
          {t("adminNotifyEmail", "Admin notification email")}
          <button disabled={busy === "contact"} onClick={() => save("contact", c)} className="btn btn-primary">Save contact details</button>
        </section>
      </div>
    </>
  );
}
