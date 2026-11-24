import type { Metadata } from "next";
import { BookingWizard } from "@/components/BookingWizard";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Book Appointment", description: "Book your Tempest Barber Lounge appointment online in a few steps." };

export default async function BookPage({ searchParams }: { searchParams: Promise<{ service?: string; barber?: string }> }) {
  const { service, barber } = await searchParams;
  const user = await getUser();
  return (
    <div className="bg-sand">
      <BookingWizard user={user ? { name: user.name, email: user.email, phone: user.phone } : null} initialService={service} initialBarber={barber} />
    </div>
  );
}
