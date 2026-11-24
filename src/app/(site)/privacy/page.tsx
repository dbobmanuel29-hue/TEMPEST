import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="2026"
      sections={[
        { h: "What we collect", p: <p>When you book or create an account we collect your name, phone number, email address, booking details and any notes you add. If you subscribe to our newsletter we store your email address. If you contact us we store your message.</p> },
        { h: "How we use it", p: <p>We use your information to manage appointments, send booking confirmations and reminders (when email or messaging is configured), respond to enquiries and, if you opted in, send updates and offers.</p> },
        { h: "Payments", p: <p>If online card payment is enabled, payments are processed by Paystack. We never see or store your full card details.</p> },
        { h: "Sharing & storage", p: <p>We do not sell your data. Information is stored in our database and shared only with service providers needed to run the website, such as hosting, email and payment providers.</p> },
        { h: "Your choices", p: <p>You can request access to, correction of or deletion of your data, and unsubscribe from marketing at any time, by contacting us using the details on our Contact page.</p> },
      ]}
    />
  );
}
