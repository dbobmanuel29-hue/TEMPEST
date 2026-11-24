import type { MetadataRoute } from "next";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const pages = ["", "/services", "/gallery", "/about", "/barbers", "/reviews", "/contact", "/book", "/privacy", "/terms", "/cancellation-policy"];
  let svc: { slug: string }[] = [];
  try {
    svc = await db.select({ slug: services.slug }).from(services).where(eq(services.active, true));
  } catch {
    /* database not ready */
  }
  return [...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })), ...svc.map((s) => ({ url: `${base}/services/${s.slug}`, priority: 0.6 }))];
}
