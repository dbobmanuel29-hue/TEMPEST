import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="2026"
      sections={[
        { h: "Bookings", p: <p>Appointments booked online are subject to confirmation by Tempest Barber Lounge. Please arrive on time; late arrivals may need to be shortened or rescheduled so we can respect the next client.</p> },
        { h: "Prices", p: <p>Prices shown are starting prices and may vary with hair length, complexity or add-on services. The final price will be confirmed before the service begins.</p> },
        { h: "Cancellations & no-shows", p: <p>Please see our Cancellation Policy. Repeated no-shows may affect your ability to book online.</p> },
        { h: "Conduct", p: <p>We reserve the right to refuse service to anyone who behaves in a threatening or abusive manner towards staff or other clients.</p> },
        { h: "Liability", p: <p>We take care in every service. Please tell us about allergies or skin conditions before treatment. Nothing in these terms limits liability that cannot be excluded by law.</p> },
      ]}
    />
  );
}
