import { db } from "@/db";
import { services } from "@/db/schema";
import { ok, requireAdmin, route } from "@/lib/api";
import { slugify } from "@/lib/data";
import { serviceSchema } from "@/lib/schemas";

export const POST = route(async (req) => {
  await requireAdmin();
  const d = serviceSchema.parse(await req.json());
  const slug = `${slugify(d.name) || "service"}-${Math.random().toString(36).slice(2, 6)}`;
  const [row] = await db.insert(services).values({ ...d, slug }).returning();
  return ok({ service: row }, 201);
});
