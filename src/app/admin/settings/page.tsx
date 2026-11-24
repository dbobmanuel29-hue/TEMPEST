import { SettingsManager } from "@/components/admin/SettingsManager";
import { emailConfigured, getContact, getPaymentSettings, googleConfigured, paystackConfigured } from "@/lib/settings";

export default async function AdminSettings() {
  const [payments, contact] = await Promise.all([getPaymentSettings(), getContact()]);
  return (
    <SettingsManager
      payments={payments}
      contact={contact}
      integrations={[
        { label: "Paystack", ok: paystackConfigured(), hint: "Set PAYSTACK_SECRET_KEY, then add /api/payments/paystack/webhook as the webhook URL in Paystack." },
        { label: "Email (Resend)", ok: emailConfigured(), hint: "Set RESEND_API_KEY and EMAIL_FROM to send confirmations, cancellations, reschedule updates and reminders." },
        { label: "Google sign-in", ok: googleConfigured(), hint: "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET; add {APP_URL}/api/auth/google/callback as an authorised redirect URI." },
        { label: "Appointment reminders", ok: Boolean(process.env.CRON_SECRET) && emailConfigured(), hint: "Needs CRON_SECRET + email. vercel.json calls /api/cron/reminders daily." },
      ]}
    />
  );
}
