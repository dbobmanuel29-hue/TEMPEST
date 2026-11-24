import { ok, route } from "@/lib/api";
import { getBarbers, getServices } from "@/lib/data";
import { getBusiness, getPaymentSettings, paystackConfigured } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const [services, barbers, business, pay] = await Promise.all([getServices(), getBarbers(), getBusiness(), getPaymentSettings()]);
  const methods: { id: string; label: string }[] = [];
  if (pay.payAtShop && pay.mode === "none") methods.push({ id: "pay_at_shop", label: "Pay at the barbershop" });
  if (pay.bankTransfer.enabled) methods.push({ id: "bank_transfer", label: "Bank transfer" });
  if (pay.card.enabled && paystackConfigured()) methods.push({ id: "card", label: "Pay online by card (Paystack)" });
  return ok({
    services: services.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDescription: s.shortDescription,
      priceNgn: s.priceNgn,
      durationMin: s.durationMin,
      imageUrl: s.imageUrl,
    })),
    barbers: barbers.map((b) => ({
      id: b.id,
      name: b.name,
      bio: b.bio,
      specialties: b.specialties,
      photoUrl: b.photoUrl,
      workingHours: b.workingHours,
    })),
    business: { hours: business.hours, maxAdvanceDays: business.maxAdvanceDays, cancelHoursBefore: business.cancelHoursBefore },
    payments: {
      methods,
      mode: pay.mode,
      depositPercent: pay.depositPercent,
      bankDetails: pay.bankTransfer.enabled ? pay.bankTransfer.details : "",
    },
  });
});
