import { desc, eq, or } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingCard, type BookingView } from "@/components/BookingCard";
import { PageHeader } from "@/components/PageHeader";
import { ProfileForm } from "@/components/ProfileForm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { cancelState } from "@/lib/bookings";
import { getBusiness } from "@/lib/settings";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  const [rows, business] = await Promise.all([
    db.select().from(bookings).where(or(eq(bookings.userId, user.id), eq(bookings.customerEmail, user.email.toLowerCase()))).orderBy(desc(bookings.date), desc(bookings.startMin)),
    getBusiness(),
  ]);
  const withPolicy = rows.map((b) => ({ b: b as unknown as BookingView, p: cancelState(b, business.cancelHoursBefore) }));
  const upcoming = withPolicy.filter((x) => x.p.open).reverse();
  const history = withPolicy.filter((x) => !x.p.open);

  return (
    <>
      <PageHeader eyebrow="My account" title={<>Hi, {user.name.split(" ")[0]}</>} />
      <section className="bg-cream py-14">
        <div className="container-x max-w-4xl space-y-16">
          <div id="upcoming">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="display text-3xl">Upcoming appointments</h2>
              <Link href="/book" className="btn btn-primary btn-sm">New booking</Link>
            </div>
            <div className="space-y-4">
              {upcoming.map((x) => <BookingCard key={x.b.id} booking={x.b} policy={x.p} cancelHours={business.cancelHoursBefore} />)}
              {!upcoming.length && <p className="border border-dashed border-espresso/40 p-6 text-sm">No upcoming appointments. <Link href="/book" className="underline">Book one now</Link>.</p>}
            </div>
          </div>
          <div id="history">
            <h2 className="display mb-6 text-3xl">Booking history</h2>
            <div className="space-y-4">
              {history.map((x) => <BookingCard key={x.b.id} booking={x.b} policy={x.p} cancelHours={business.cancelHoursBefore} />)}
              {!history.length && <p className="text-sm text-espresso/70">Completed and cancelled bookings will appear here.</p>}
            </div>
            {history.some((x) => x.b.status === "completed") && <p className="mt-6 text-sm">Enjoyed your visit? <Link href="/reviews#write" className="underline">Leave a review</Link>.</p>}
          </div>
          <div id="settings">
            <h2 className="display mb-6 text-3xl">Account settings</h2>
            <ProfileForm user={user} />
          </div>
        </div>
      </section>
    </>
  );
}
