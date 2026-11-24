import { db } from "@/db";
import { notifications, type bookings } from "@/db/schema";
import { emailConfigured, getContact } from "@/lib/settings";
import { fmtDate, fmtMin, formatNaira } from "@/lib/time";

type Booking = typeof bookings.$inferSelect;

/**
 * Sends an email through Resend when RESEND_API_KEY + EMAIL_FROM are configured.
 * Otherwise the attempt is logged honestly as "not_configured" (nothing is faked).
 */
export async function sendEmail(opts: { to: string; subject: string; text: string; kind: string; bookingId?: string }) {
  if (!opts.to) return;
  let status: "sent" | "failed" | "not_configured" = "not_configured";
  let error: string | null = null;
  if (emailConfigured()) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [opts.to], subject: opts.subject, text: opts.text }),
      });
      if (res.ok) status = "sent";
      else {
        status = "failed";
        error = `Resend ${res.status}: ${(await res.text()).slice(0, 300)}`;
      }
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : "unknown";
    }
  }
  try {
    await db.insert(notifications).values({
      kind: opts.kind,
      recipient: opts.to,
      subject: opts.subject,
      status,
      error,
      bookingId: opts.bookingId ?? null,
    });
  } catch (e) {
    console.error("notification log failed", e);
  }
}

const summary = (b: Booking) =>
  [
    `Reference: ${b.reference}`,
    `Service: ${b.serviceName} (${formatNaira(b.priceNgn)})`,
    `Barber: ${b.barberName}`,
    `When: ${fmtDate(b.date)} at ${fmtMin(b.startMin)} (Africa/Lagos)`,
    `Status: ${b.status}`,
  ].join("\n");

async function adminEmail() {
  const c = await getContact();
  return c.adminNotifyEmail || process.env.ADMIN_NOTIFY_EMAIL || "";
}

export async function notifyBookingCreated(b: Booking) {
  await Promise.all([
    sendEmail({
      to: b.customerEmail,
      kind: "booking_confirmation",
      bookingId: b.id,
      subject: `Your Tempest booking ${b.reference}`,
      text: `Hi ${b.customerName},\n\nThanks for booking with Tempest Barber Lounge.\n\n${summary(b)}\n\nLOOK SHARP. FEEL POWERFUL.`,
    }),
    sendEmail({
      to: await adminEmail(),
      kind: "admin_new_booking",
      bookingId: b.id,
      subject: `New appointment ${b.reference}`,
      text: `${summary(b)}\n\nCustomer: ${b.customerName} · ${b.customerPhone} · ${b.customerEmail}\nNotes: ${b.notes || "—"}`,
    }),
  ]);
}

export async function notifyStatusChange(b: Booking, by: "customer" | "admin") {
  const label = b.status === "cancelled" ? "cancelled" : b.status;
  await sendEmail({
    to: b.customerEmail,
    kind: `booking_${b.status}`,
    bookingId: b.id,
    subject: `Your Tempest booking ${b.reference} is ${label}`,
    text: `Hi ${b.customerName},\n\nYour booking status is now: ${label}.\n\n${summary(b)}`,
  });
  if (by === "customer" && b.status === "cancelled") {
    await sendEmail({
      to: await adminEmail(),
      kind: "admin_cancellation",
      bookingId: b.id,
      subject: `Booking cancelled ${b.reference}`,
      text: `${b.customerName} cancelled.\n\n${summary(b)}`,
    });
  }
}

export async function notifyRescheduleRequested(b: Booking) {
  const r = b.rescheduleRequest;
  await Promise.all([
    sendEmail({
      to: b.customerEmail,
      kind: "reschedule_received",
      bookingId: b.id,
      subject: `Reschedule request received ${b.reference}`,
      text: `Hi ${b.customerName},\n\nWe received your request to move your appointment. We'll confirm shortly.\n\n${summary(b)}`,
    }),
    sendEmail({
      to: await adminEmail(),
      kind: "admin_reschedule_request",
      bookingId: b.id,
      subject: `Reschedule request ${b.reference}`,
      text: `${b.customerName} asked to move to ${r ? fmtDate(r.date) : "?"}${r?.startMin != null ? " at " + fmtMin(r.startMin) : ""}.\nNote: ${r?.note || "—"}\n\nCurrent:\n${summary(b)}`,
    }),
  ]);
}

export async function notifyReminder(b: Booking) {
  await sendEmail({
    to: b.customerEmail,
    kind: "reminder",
    bookingId: b.id,
    subject: `Reminder: your Tempest appointment on ${fmtDate(b.date, true)}`,
    text: `Hi ${b.customerName},\n\nThis is a reminder of your upcoming appointment.\n\n${summary(b)}`,
  });
}
