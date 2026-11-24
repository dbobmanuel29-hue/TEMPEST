import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { barbers, reviews, services } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export async function getServices(opts: { includeInactive?: boolean } = {}) {
  await ensureSeeded();
  const q = db.select().from(services);
  const rows = opts.includeInactive ? await q.orderBy(services.sortOrder) : await q.where(eq(services.active, true)).orderBy(services.sortOrder);
  return rows;
}

export async function getServiceBySlug(slug: string) {
  await ensureSeeded();
  const [row] = await db.select().from(services).where(and(eq(services.slug, slug), eq(services.active, true)));
  return row ?? null;
}

export async function getBarbers(opts: { includeInactive?: boolean } = {}) {
  await ensureSeeded();
  const q = db.select().from(barbers);
  return opts.includeInactive ? q.orderBy(barbers.sortOrder) : q.where(eq(barbers.active, true)).orderBy(barbers.sortOrder);
}

export async function getApprovedReviews(limit?: number) {
  await ensureSeeded();
  const q = db.select().from(reviews).where(eq(reviews.status, "approved")).orderBy(desc(reviews.createdAt));
  return limit ? q.limit(limit) : q;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
