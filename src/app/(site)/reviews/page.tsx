import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { NoReviews, ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { getUser } from "@/lib/auth";
import { getApprovedReviews } from "@/lib/data";

export const metadata: Metadata = { title: "Reviews", description: "Read feedback from Tempest Barber Lounge customers." };

export default async function ReviewsPage() {
  const [reviews, user] = await Promise.all([getApprovedReviews(), getUser()]);
  return (
    <>
      <PageHeader eyebrow="Reviews" title={<>What clients<br />are saying</>} intro="Every review here was submitted by a real customer and approved by our team." />
      <section className="bg-cream py-16 md:py-20">
        <div className="container-x">
          {reviews.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <div key={r.id} data-reveal><ReviewCard r={r} /></div>
              ))}
            </div>
          ) : (
            <NoReviews />
          )}
        </div>
      </section>
      <section id="write" className="bg-sand py-16 md:py-20">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="display text-4xl">Share your experience</h2>
            <p className="mt-4 max-w-sm text-espresso/75">Reviews are moderated before they appear on the website.</p>
          </div>
          <div>
            {user ? (
              <ReviewForm />
            ) : (
              <div className="border border-espresso/30 p-6">
                <p className="text-sm">Please sign in to leave a review — it helps us keep feedback genuine.</p>
                <div className="mt-4 flex gap-3">
                  <Link href="/login?next=/reviews" className="btn btn-primary btn-sm">Sign in</Link>
                  <Link href="/register?next=/reviews" className="btn btn-outline btn-sm">Create account</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
