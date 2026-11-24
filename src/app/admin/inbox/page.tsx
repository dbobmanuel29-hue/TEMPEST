import { desc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/AdminUI";
import { db } from "@/db";
import { contactMessages, newsletterSubscribers, notifications } from "@/db/schema";

const fmt = (d: Date) => d.toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });

export default async function AdminInbox() {
  const [msgs, subs, logs] = await Promise.all([
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(50),
    db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt)).limit(500),
    db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(60),
  ]);
  return (
    <>
      <PageTitle title="Inbox & logs" sub="Contact-form messages, newsletter subscribers and the outbound notification log." />
      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <h2 className="display mb-3 text-xl">Messages ({msgs.length})</h2>
          <ul className="space-y-3">
            {msgs.map((m) => (
              <li key={m.id} className="border border-espresso/20 bg-white p-4 text-sm">
                <p className="font-semibold">{m.name} <span className="font-normal text-espresso/60">· {fmt(m.createdAt)}</span></p>
                <p className="text-espresso/70"><a href={`mailto:${m.email}`} className="hover:text-cobalt">{m.email}</a>{m.phone && ` · ${m.phone}`}</p>
                <p className="mt-2 whitespace-pre-line">{m.message}</p>
              </li>
            ))}
            {!msgs.length && <li className="text-sm text-espresso/60">No messages yet.</li>}
          </ul>
        </section>
        <section className="space-y-10">
          <div>
            <h2 className="display mb-3 text-xl">Newsletter subscribers ({subs.length})</h2>
            <div className="max-h-72 overflow-y-auto border border-espresso/20 bg-white p-3 text-sm">
              {subs.map((s) => <p key={s.id} className="flex justify-between gap-2 py-1"><span className="truncate">{s.email}</span><span className="shrink-0 text-xs text-espresso/50">{fmt(s.createdAt)}</span></p>)}
              {!subs.length && <p className="text-espresso/60">No subscribers yet.</p>}
            </div>
            <p className="mt-2 text-xs text-espresso/60">Subscribers are stored here. Sending campaigns requires connecting an email provider.</p>
          </div>
          <div>
            <h2 className="display mb-3 text-xl">Notification log</h2>
            <ul className="space-y-2 text-sm">
              {logs.map((l) => (
                <li key={l.id} className="border border-espresso/20 bg-white p-3">
                  <p className="flex justify-between gap-2"><span className="truncate font-medium">{l.subject}</span><span className={`eyebrow shrink-0 ${l.status === "sent" ? "text-cobalt" : ""}`}>{l.status.replace("_", " ")}</span></p>
                  <p className="text-xs text-espresso/60">{l.kind} → {l.recipient} · {fmt(l.createdAt)}{l.error ? ` · ${l.error}` : ""}</p>
                </li>
              ))}
              {!logs.length && <li className="text-espresso/60">Nothing logged yet.</li>}
            </ul>
            <p className="mt-2 text-xs text-espresso/60">“not configured” means the event happened but no email was sent because email isn&apos;t set up.</p>
          </div>
        </section>
      </div>
    </>
  );
}
