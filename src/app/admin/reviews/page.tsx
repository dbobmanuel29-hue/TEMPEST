import { desc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/AdminUI";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { db } from "@/db";
import { reviews } from "@/db/schema";

export default async function AdminReviews() {
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  return (
    <>
      <PageTitle title="Reviews" sub="Only approved reviews appear on the website. Nothing is auto-published." />
      <ReviewsManager reviews={rows.map((r) => ({ id: r.id, name: r.name, rating: r.rating, body: r.body, status: r.status, createdAt: r.createdAt.toISOString() }))} />
    </>
  );
}
