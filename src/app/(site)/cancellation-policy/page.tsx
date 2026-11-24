import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getBusiness } from "@/lib/settings";

export const metadata: Metadata = { title: "Cancellation Policy" };

export default async function Cancellation() {
  const b = await getBusiness();
  return (
    <LegalPage
      title="Cancellation Policy"
      updated="2026"
      sections={[
        { h: "Cancelling online", p: <p>You can cancel a pending or confirmed appointment online up to <strong>{b.cancelHoursBefore} hours</strong> before its start time from your account or the “Manage booking” page.</p> },
        { h: "Late cancellations", p: <p>Inside that window, please contact the shop directly. We will do our best to help, but late cancellations may be treated as no-shows.</p> },
        { h: "Rescheduling", p: <p>You can request a new date or time online. A request is not a confirmed change — we will confirm the new slot with you.</p> },
        { h: "Deposits & refunds", p: <p>If a deposit or full payment was taken online, refunds are handled by the shop according to the timing of your cancellation. Contact us for details.</p> },
      ]}
    />
  );
}
